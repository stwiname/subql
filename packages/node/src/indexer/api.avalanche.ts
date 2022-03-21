// Copyright 2020-2022 OnFinality Limited authors & contributors
// SPDX-License-Identifier: Apache-2.0

import {
  ApiWrapper,
  AvalancheBlock,
  AvalancheEvent,
  AvalancheBlockWrapper,
  AvalancheTransaction,
  AvalancheEventFilter,
  AvalancheCallFilter,
} from '@subql/types';
import { Avalanche, BinTools } from 'avalanche';
import { EVMAPI } from 'avalanche/dist/apis/evm';
import { IndexAPI } from 'avalanche/dist/apis/index';
import {
  eventToTopic,
  functionToSighash,
  hexStringEq,
  stringNormalizedEq,
} from '../utils/string';
import { AvalancheOptions } from './types';

export class AvalancheApi implements ApiWrapper<AvalancheBlockWrapper> {
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

  async fetchBlocks(bufferBlocks: number[]): Promise<AvalancheBlockWrapper[]> {
    return Promise.all(
      bufferBlocks.map(async (num) => {
        const block_promise = this.cchain.callMethod(
          'eth_getBlockByNumber',
          [`0x${num.toString(16)}`, true],
          '/ext/bc/C/rpc',
        );
        const logs_promise = this.cchain.callMethod(
          'eth_getLogs',
          [
            {
              fromBlock: `0x${num.toString(16)}`,
              toBlock: `0x${num.toString(16)}`,
            },
          ],
          '/ext/bc/C/rpc',
        );
        return new AvalancheBlockWrapped(
          (await block_promise).data.result,
          (await logs_promise).data.result,
        );
      }),
    );
  }
}

export class AvalancheBlockWrapped implements AvalancheBlockWrapper {
  constructor(
    private _block: AvalancheBlock,
    private _logs: AvalancheEvent[],
  ) {}

  get block(): AvalancheBlock {
    return this._block;
  }

  get blockHeight(): number {
    return parseInt(this.block.number);
  }

  get hash(): string {
    return this.block.hash;
  }

  calls(filter?: AvalancheCallFilter): AvalancheTransaction[] {
    if (!filter) {
      return this.block.transactions;
    }
    const transactions = this.block.transactions.filter((t) =>
      this.filterCallProcessor(t, filter),
    );
    return transactions;
  }

  events(filter?: AvalancheEventFilter): AvalancheEvent[] {
    if (!filter) {
      return this._logs;
    }

    return this._logs.filter((log) => this.filterEventsProcessor(log, filter));
  }

  private filterCallProcessor(
    transaction: AvalancheTransaction,
    filter: AvalancheCallFilter | AvalancheCallFilter[],
  ): boolean {
    let filters: AvalancheCallFilter[];
    if (!(filter instanceof Array)) {
      filters = [filter];
    } else {
      filters = filter as AvalancheCallFilter[];
    }
    if (!filters.length) {
      return true;
    }
    return Boolean(
      filters.find((filt) => {
        if (filt.to && !stringNormalizedEq(filt.to, transaction.to)) {
          return false;
        }
        if (filt.from && !stringNormalizedEq(filt.from, transaction.from)) {
          return false;
        }

        if (
          filt.function &&
          transaction.input.indexOf(functionToSighash(filt.function)) !== 0
        ) {
          return false;
        }
        return true;
      }),
    );
  }

  private filterEventsProcessor(
    log: AvalancheEvent,
    filter: AvalancheEventFilter | AvalancheEventFilter[],
  ): boolean {
    let filters: AvalancheEventFilter[];
    if (!(filter instanceof Array)) {
      filters = [filter];
    } else {
      filters = filter as AvalancheEventFilter[];
    }
    if (!filters.length) {
      return true;
    }
    return Boolean(
      filters.find((filt) => {
        if (filt.address && !stringNormalizedEq(filt.address, log.address)) {
          return false;
        }

        if (filt.topics) {
          for (let i = 0; i < Math.min(filt.topics.length, 4); i++) {
            const topic = filt.topics[i];
            if (!topic) {
              continue;
            }

            if (!hexStringEq(eventToTopic(topic), log.topics[i])) {
              return false;
            }
          }
        }
        console.log(true);
        return true;
      }),
    );
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
