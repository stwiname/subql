// Copyright 2020-2022 OnFinality Limited authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { filterCallsSome } from '@polkadot/types/metadata/decorate';
import {
  ApiWrapper,
  AvalancheBlock,
  AvalancheEvent,
  BlockWrapper,
  AvalancheBlockWrapper,
  AvalancheTransaction,
  SubqlCallFilter,
} from '@subql/types';
import { Avalanche, BinTools } from 'avalanche';
import { EVMAPI } from 'avalanche/dist/apis/evm';
import { IndexAPI } from 'avalanche/dist/apis/index';
import { AvalancheOptions } from './types';

export class AvalancheApi implements ApiWrapper {
  private client: Avalanche;
  private indexApi: IndexAPI;
  private genesisBlock: Record<string, any>;
  private encoding: string;
  private baseUrl: string;
  private bintools: BinTools;
  private cchain: EVMAPI;

  constructor(private options: AvalancheOptions) {
    this.encoding = 'cb58';
    this.client = new Avalanche(this.options.ip, this.options.port, 'http');
    this.client.setAuthToken(this.options.token);
    this.indexApi = this.client.Index();
    this.bintools = BinTools.getInstance();
    this.cchain = this.client.CChain();
    switch (this.options.chainName) {
      case 'XV':
        this.baseUrl = '/ext/index/X/vtx';
        break;
      case 'XT':
        this.baseUrl = '/ext/index/X/tx';
        break;
      case 'C':
        this.baseUrl = '/ext/index/C/block';
        break;
      case 'P':
        this.baseUrl = '/ext/index/P/block';
        break;
      default:
        break;
    }
  }

  async init(): Promise<void> {
    this.genesisBlock = (
      await this.cchain.callMethod(
        'eth_getBlockByNumber',
        ['0x0', true],
        '/ext/bc/C/rpc',
      )
    ).data.result;
  }

  getGenesisHash(): string {
    return this.genesisBlock.hash;
  }

  getRuntimeChain(): string {
    return this.options.chainName;
  }

  getSpecName(): string {
    return 'avalanche';
  }

  async getFinalizedBlockHeight(): Promise<number> {
    const lastAccepted = await this.indexApi.getLastAccepted(
      this.encoding,
      this.baseUrl,
    );
    const finalizedBlockHeight = parseInt(lastAccepted.index);
    return finalizedBlockHeight;
  }

  async getLastHeight(): Promise<number> {
    const lastAccepted = await this.indexApi.getLastAccepted(
      this.encoding,
      this.baseUrl,
    );
    const lastHeight = parseInt(lastAccepted.index);
    return lastHeight;
  }

  async fetchBlocks(bufferBlocks: number[]): Promise<BlockWrapper[]> {
    return Promise.all(
      bufferBlocks.map(async (num) => {
        const block_promise = this.cchain.callMethod(
          'eth_getBlockByNumber',
          [`0x${num.toString(16)}`, true],
          '/ext/bc/C/rpc',
        );
        const logs_promise = this.cchain.callMethod('eth_getlogs', [
          { fromBlock: num, toBlock: num },
          '/ext/bc/C/rpc',
        ]);
        return new AvalancheBlockWrapped(
          (await block_promise).data.result,
          (await logs_promise).data.result,
        );
      }),
    );
  }
}

export class AvalancheBlockWrapped implements AvalancheBlockWrapper {
  constructor(private block: AvalancheBlock, private logs: AvalancheEvent[]) {}

  getBlock(): AvalancheBlock {
    return this.block;
  }

  getBlockHeight(): number {
    return parseInt(this.block.number);
  }

  getHash(): string {
    return this.block.hash;
  }

  getEvents(): AvalancheEvent[] {
    return this.logs;
  }

  getCalls(filter?: SubqlCallFilter): AvalancheTransaction[] {
    const transactions = this.block.transactions.filter((t) =>
      this.filterProcessor(t, filter),
    );
    return transactions;
  }

  private filterProcessor(
    transaction: AvalancheTransaction,
    filter?: SubqlCallFilter,
  ): boolean {
    const { from, to } = transaction;
    if (
      filter?.from &&
      from &&
      filter.from.toLowerCase() !== from?.toLowerCase()
    ) {
      return false;
    }
    if (filter?.to && to && filter.to.toLowerCase() !== to.toLowerCase()) {
      return false;
    }
    return true;
  }

  /****************************************************/
  /*           AVALANCHE SPECIFIC METHODS             */
  /****************************************************/

  get(objects: string[]): Record<string, any> {
    return objects.map((obj) => this.block[obj]);
  }

  getTransactions(filters?: string[]): Record<string, any> {
    if (!filters) {
      return this.block.transactions;
    }
    return this.block.transactions.map((trx) => {
      const filteredTrx = {};
      filters.forEach((filter) => {
        filteredTrx[filter] = trx[filter];
      });
      return filteredTrx;
    });
  }
}
