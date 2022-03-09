// Copyright 2020-2022 OnFinality Limited authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { ApiWrapper, AvalancheBlock, BlockWrapper } from '@subql/types';
import { Avalanche, BinTools } from 'avalanche';
import { EVMAPI, Tx, UnsignedTx } from 'avalanche/dist/apis/evm';
import { IndexAPI } from 'avalanche/dist/apis/index';
import { GetContainerByIndexResponse } from 'avalanche/dist/apis/index/interfaces';
import { AvalancheOptions } from './types';

export class AvalancheApi implements ApiWrapper {
  private client: Avalanche;
  private indexApi: IndexAPI;
  private genesisBlock: GetContainerByIndexResponse;
  private encoding: string;
  private baseUrl: string;
  private bintools: BinTools;
  private cchain: EVMAPI;

  constructor(private options: AvalancheOptions) {
    this.encoding = 'cb58';
    this.client = new Avalanche(this.options.ip, this.options.port);
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
    this.genesisBlock = await this.indexApi.getContainerByIndex(
      '0',
      this.encoding,
      this.baseUrl,
    );
  }

  getGenesisHash(): string {
    return this.genesisBlock.id;
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
    const lastHeight = await this.indexApi.getIndex(lastAccepted.id);
    return parseInt(lastHeight);
  }

  async fetchBlocks(bufferBlocks: number[]): Promise<BlockWrapper[]> {
    const blocks = await this.indexApi.getContainerRange(
      bufferBlocks[0],
      bufferBlocks.length,
      this.encoding,
      this.baseUrl,
    );

    const test = new Tx();
    let offset = 0;
    const bytes = this.bintools.cb58Decode(blocks.containers[0].bytes);
    console.log(blocks.containers[0]);
    const codecID = this.bintools
      .copyFrom(bytes, offset, offset + 2)
      .readUInt16BE(0);
    offset += 2;
    const txtype = this.bintools
      .copyFrom(bytes, offset, offset + 4)
      .readUInt32BE(0);
    console.log(codecID, txtype);
    try {
      const atotx = test.fromBuffer(bytes);
      console.log(atotx);
    } catch (error) {
      console.log(error);
    }
    return blocks.containers.map((b) => new AvalancheBlockWrapped(b));
  }
}

export class AvalancheBlockWrapped implements BlockWrapper {
  constructor(private block: AvalancheBlock) {}

  getBlock(): AvalancheBlock {
    return { bytes: this.block.bytes };
  }

  getBlockHeight(): number {
    return parseInt(this.block.index);
  }

  getHash(): string {
    return this.block.id;
  }
}
