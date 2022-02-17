// Copyright 2020-2022 OnFinality Limited authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import algosdk from 'algosdk';
import { SubqueryProject } from '../configure/SubqueryProject';
// import { getLogger } from '../utils/logger';
import { NetworkMetadataPayload } from './events';
import { ApiAt } from './types';

// const NOT_SUPPORT = (name: string) => () => {
//   throw new Error(`${name}() is not supported`);
// };

// const logger = getLogger('api');

@Injectable()
export class ApiService {
  private api: algosdk.Algodv2;
  private currentBlockHash: string;
  private currentBlockNumber: number;
//  private currentRuntimeVersion: RuntimeVersion;
//  private apiOption: ApiOptions;
  networkMeta: NetworkMetadataPayload;

  constructor(
    protected project: SubqueryProject,
    private eventEmitter: EventEmitter2,
  ) {}

  async init(): Promise<ApiService> {
    // let chainTypes, network;
    // try {
    //   chainTypes = this.project.chainTypes;
    //   network = this.project.network;
    // } catch (e) {
    //   logger.error(e);
    //   process.exit(1);
    // }

    // let provider: WsProvider | HttpProvider;
    // let throwOnConnect = false;
    // if (network.endpoint.startsWith('ws')) {
    //   provider = new WsProvider(network.endpoint);
    // } else if (network.endpoint.startsWith('http')) {
    //   provider = new HttpProvider(network.endpoint);
    //   throwOnConnect = true;
    // }

    // this.apiOption = {
    //   provider,
    //   throwOnConnect,
    //   ...chainTypes,
    // };

    const token = 'a51a4df895858d2234df7ada60437bc6f5591509191932f3d86f1c4e5edfd2ec';
    const server = 'http://127.0.0.1';
    const port = 8080;
    this.api = new algosdk.Algodv2(token, server, port);

    // this.eventEmitter.emit(IndexerEvent.ApiConnected, { value: 1 });
    // this.api.on('connected', () => {
    //   this.eventEmitter.emit(IndexerEvent.ApiConnected, { value: 1 });
    // });
    // this.api.on('disconnected', () => {
    //   this.eventEmitter.emit(IndexerEvent.ApiConnected, { value: 0 });
    // });

    const { block : genesisBlock } = await this.api.block(0).do()

    this.networkMeta = {
      chain: genesisBlock.gen.toString(),
      specName: "",
      genesisHash: genesisBlock.gh.toString(),
    };

    // if (
    //   network.genesisHash &&
    //   network.genesisHash !== this.networkMeta.genesisHash
    // ) {
    //   const err = new Error(
    //     `Network genesisHash doesn't match expected genesisHash. expected="${network.genesisHash}" actual="${this.networkMeta.genesisHash}`,
    //   );
    //   logger.error(err, err.message);
    //   throw err;
    // }

    return this;
  }

  getApi(): algosdk.Algodv2 {
    return this.api;
  }

  getPatchedApi(
     blockHash: string,
     blockNumber: number,
     parentBlockHash?: string,
   ): ApiAt {
  //   this.currentBlockHash = blockHash.toString();
  //   this.currentBlockNumber = blockNumber;
  //   if (parentBlockHash) {
  //     this.currentRuntimeVersion = await this.api.rpc.state.getRuntimeVersion(
  //       parentBlockHash,
  //     );
  //   }
  //   const apiAt = (await this.api.at(
  //     blockHash,
  //     this.currentRuntimeVersion,
  //   )) as ApiAt;
  //   this.patchApiRpc(this.api, apiAt);
  //   return apiAt;
    return this.api;
  }

  // private redecorateRpcFunction<T extends 'promise' | 'rxjs'>(
  //   original: RpcMethodResult<T, AnyFunction>,
  // ): RpcMethodResult<T, AnyFunction> {
  //   const methodName = this.getRPCFunctionName(original);
  //   if (original.meta.params) {
  //     const hashIndex = original.meta.params.findIndex(
  //       ({ isHistoric }) => isHistoric,
  //     );
  //     if (hashIndex > -1) {
  //       const isBlockNumber =
  //         original.meta.params[hashIndex].type === 'BlockNumber';

  //       const ret = ((...args: any[]) => {
  //         const argsClone = [...args];
  //         argsClone[hashIndex] = isBlockNumber
  //           ? this.currentBlockNumber
  //           : this.currentBlockHash;
  //         return original(...argsClone);
  //       }) as RpcMethodResult<T, AnyFunction>;
  //       ret.raw = NOT_SUPPORT(`${methodName}.raw`);
  //       ret.meta = original.meta;
  //       return ret;
  //     }
  //   }

  //   const ret = NOT_SUPPORT(methodName) as unknown as RpcMethodResult<
  //     T,
  //     AnyFunction
  //   >;
  //   ret.raw = NOT_SUPPORT(`${methodName}.raw`);
  //   ret.meta = original.meta;
  //   return ret;
  // }

  // private patchApiRpc(api: ApiPromise, apiAt: ApiAt): void {
  //   apiAt.rpc = Object.entries(api.rpc).reduce((acc, [module, rpcMethods]) => {
  //     acc[module] = Object.entries(rpcMethods).reduce(
  //       (accInner, [name, rpcPromiseResult]) => {
  //         accInner[name] = this.redecorateRpcFunction(rpcPromiseResult);
  //         return accInner;
  //       },
  //       {},
  //     );
  //     return acc;
  //   }, {} as ApiPromise['rpc']);
  // }

  // private getRPCFunctionName<T extends 'promise' | 'rxjs'>(
  //   original: RpcMethodResult<T, AnyFunction>,
  // ): string {
  //   const ext = original.meta as unknown as DefinitionRpcExt;

  //   return `api.rpc.${ext?.section ?? '*'}.${ext?.method ?? '*'}`;
  // }
}
