// Copyright 2020-2022 OnFinality Limited authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { EventEmitter2 } from '@nestjs/event-emitter';
import { ApiPromise, HttpProvider, WsProvider } from '@polkadot/api';
import {
  ApiInterfaceEvents,
  ApiOptions,
  RpcMethodResult,
} from '@polkadot/api/types';
import { BlockHash, RuntimeVersion } from '@polkadot/types/interfaces';
import {
  AnyFunction,
  DefinitionRpcExt,
  RegisteredTypes,
} from '@polkadot/types/types';
import { ProjectNetworkConfig } from '@subql/common';
import { SubstrateBlock, ApiWrapper, BlockWrapper } from '@subql/types';
import {
  SubstrateExtrinsic,
  SubstrateEvent,
} from '../../../types/dist/interfaces';
import { profiler, profilerWrap } from '../utils/profiler';
import * as SubstrateUtil from '../utils/substrate';
import { getYargsOption } from '../yargs';
import { IndexerEvent } from './events';
import { ApiAt } from './types';

const NOT_SUPPORT = (name: string) => () => {
  throw new Error(`${name}() is not supported`);
};

export class SubstrateApi implements ApiWrapper {
  private client: ApiPromise;
  private currentBlockHash: string;
  private currentBlockNumber: number;
  private currentRuntimeVersion: RuntimeVersion;
  private options: ApiOptions;
  private parentSpecVersion: number;

  constructor(
    network: Partial<ProjectNetworkConfig>,
    chainTypes: RegisteredTypes,
    private eventEmitter: EventEmitter2,
  ) {
    let provider: WsProvider | HttpProvider;
    let throwOnConnect = false;

    if (network.endpoint.startsWith('ws')) {
      provider = new WsProvider(network.endpoint);
    } else if (network.endpoint.startsWith('http')) {
      provider = new HttpProvider(network.endpoint);
      throwOnConnect = true;
    }

    this.options = {
      provider,
      throwOnConnect,
      ...chainTypes,
    };
  }

  async init(): Promise<void> {
    this.client = await ApiPromise.create(this.options);

    this.eventEmitter.emit(IndexerEvent.ApiConnected, { value: 1 });

    this.client.on('connected', () => {
      console.log('connected');
      this.eventEmitter.emit(IndexerEvent.ApiConnected, { value: 1 });
    });
    this.client.on('disconnected', () => {
      this.eventEmitter.emit(IndexerEvent.ApiConnected, { value: 0 });
    });
  }

  getGenesisHash(): string {
    return this.client.genesisHash.toString();
  }

  getRuntimeChain(): string {
    return this.client.runtimeChain.toString();
  }

  getSpecName(): string {
    return this.client.runtimeVersion.specName.toString();
  }

  async getFinalizedBlockHeight(): Promise<number> {
    const finalizedBlockHeight = (
      await this.client.rpc.chain.getBlock(
        await this.client.rpc.chain.getFinalizedHead(),
      )
    ).block.header.number.toNumber();
    return finalizedBlockHeight;
  }

  async getLastHeight(): Promise<number> {
    const lastHeight = (
      await this.client.rpc.chain.getHeader()
    ).number.toNumber();
    return lastHeight;
  }

  async fetchBlocks(bufferBlocks: number[]): Promise<BlockWrapper[]> {
    const { argv } = getYargsOption();

    const fetchBlocksProfiled = argv.profiler
      ? profilerWrap(
          SubstrateUtil.fetchBlocksBatches,
          'SubstrateUtil',
          'fetchBlocksBatches',
        )
      : SubstrateUtil.fetchBlocksBatches;

    const metadataChanged = await this.fetchMeta(
      bufferBlocks[bufferBlocks.length - 1],
    );
    const blocks = await fetchBlocksProfiled(
      this.client,
      bufferBlocks,
      metadataChanged ? undefined : this.parentSpecVersion,
    );
    return blocks;
  }

  /****************************************************/
  /*           SUBSTRATE SPECIFIC METHODS             */
  /****************************************************/

  async getPatchedApi(
    blockHash: string | BlockHash,
    blockNumber: number,
    parentBlockHash?: BlockHash,
  ): Promise<ApiAt> {
    this.currentBlockHash = blockHash.toString();
    this.currentBlockNumber = blockNumber;
    if (parentBlockHash) {
      this.currentRuntimeVersion =
        await this.client.rpc.state.getRuntimeVersion(parentBlockHash);
    }
    const apiAt = (await this.client.at(
      blockHash,
      this.currentRuntimeVersion,
    )) as ApiAt;
    this.patchApiRpc(this.client, apiAt);
    return apiAt;
  }

  async disconnect(): Promise<void> {
    await this.client.disconnect();
  }

  on(type: ApiInterfaceEvents, handler: (...args: any[]) => any): void {
    this.client.on(type, handler);
  }

  getClient(): ApiPromise {
    return this.client;
  }

  private patchApiRpc(api: ApiPromise, apiAt: ApiAt): void {
    apiAt.rpc = Object.entries(api.rpc).reduce((acc, [module, rpcMethods]) => {
      acc[module] = Object.entries(rpcMethods).reduce(
        (accInner, [name, rpcPromiseResult]) => {
          accInner[name] = this.redecorateRpcFunction(rpcPromiseResult);
          return accInner;
        },
        {},
      );
      return acc;
    }, {} as ApiPromise['rpc']);
  }

  private redecorateRpcFunction<T extends 'promise' | 'rxjs'>(
    original: RpcMethodResult<T, AnyFunction>,
  ): RpcMethodResult<T, AnyFunction> {
    const methodName = this.getRPCFunctionName(original);
    if (original.meta.params) {
      const hashIndex = original.meta.params.findIndex(
        ({ isHistoric }) => isHistoric,
      );
      if (hashIndex > -1) {
        const isBlockNumber =
          original.meta.params[hashIndex].type === 'BlockNumber';

        const ret = ((...args: any[]) => {
          const argsClone = [...args];
          argsClone[hashIndex] = isBlockNumber
            ? this.currentBlockNumber
            : this.currentBlockHash;
          return original(...argsClone);
        }) as RpcMethodResult<T, AnyFunction>;
        ret.raw = NOT_SUPPORT(`${methodName}.raw`);
        ret.meta = original.meta;
        return ret;
      }
    }

    const ret = NOT_SUPPORT(methodName) as unknown as RpcMethodResult<
      T,
      AnyFunction
    >;
    ret.raw = NOT_SUPPORT(`${methodName}.raw`);
    ret.meta = original.meta;
    return ret;
  }

  private getRPCFunctionName<T extends 'promise' | 'rxjs'>(
    original: RpcMethodResult<T, AnyFunction>,
  ): string {
    const ext = original.meta as unknown as DefinitionRpcExt;

    return `api.rpc.${ext?.section ?? '*'}.${ext?.method ?? '*'}`;
  }

  @profiler(getYargsOption().argv.profiler)
  private async fetchMeta(height: number): Promise<boolean> {
    const blockHash = await this.client.rpc.chain.getBlockHash(height);
    const runtimeVersion = await this.client.rpc.state.getRuntimeVersion(
      blockHash,
    );
    const specVersion = runtimeVersion.specVersion.toNumber();
    if (this.parentSpecVersion !== specVersion) {
      await this.client.getBlockRegistry(blockHash);
      this.parentSpecVersion = specVersion;
      return true;
    }
    return false;
  }
}

export class SubstrateBlockWrapped implements BlockWrapper {
  constructor(
    private block: SubstrateBlock,
    private extrinsics: SubstrateExtrinsic[],
    private events: SubstrateEvent[],
  ) {}

  getBlock(): SubstrateBlock {
    return this.block;
  }

  getBlockHeight(): number {
    return this.block.block.header.number.toNumber();
  }

  getHash(): string {
    return this.block.block.header.hash.toHex();
  }

  /****************************************************/
  /*           SUBSTRATE SPECIFIC METHODS             */
  /****************************************************/

  getExtrinsincs(): SubstrateExtrinsic[] {
    return this.extrinsics;
  }

  getEvents(): SubstrateEvent[] {
    return this.events;
  }
}
