// Copyright 2020-2022 OnFinality Limited authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Avalanche, BinTools } from 'avalanche';
import { IndexAPI } from 'avalanche/dist/apis/index';
import { GetContainerByIndexResponse } from 'avalanche/dist/apis/index/interfaces';
import { AvalancheOptions, ApiWrapper } from './types';

export class AvalancheApi implements ApiWrapper {
  private client: Avalanche;
  private indexApi: IndexAPI;
  private genesisBlock: GetContainerByIndexResponse;
  private encoding: string;
  private bintools: BinTools;

  constructor(private options: AvalancheOptions) {
    this.encoding = 'cb58';
    this.client = new Avalanche(
      this.options.ip,
      this.options.port,
      this.options.protocol,
      this.options.networkID,
    );
    this.indexApi = this.client.Index();
    this.bintools = BinTools.getInstance();
  }

  async init(): Promise<void> {
    const baseurl = '/ext/index/C/block';
    this.genesisBlock = await this.indexApi.getContainerByIndex(
      '0',
      this.encoding,
      baseurl,
    );
  }

  getGenesisHash(): string {
    return this.genesisBlock.bytes;
  }

  getRuntimeChain(): string {
    return this.genesisBlock.bytes;
  }

  getSpecName(): string {
    return 'avalanche';
  }

  async getFinalizedBlockHeight(): Promise<number> {
    const baseurl = '/ext/index/C/block';
    const lastAccepted = await this.indexApi.getLastAccepted(
      this.encoding,
      baseurl,
    );
    const decrypted = this.bintools.cb58Decode(lastAccepted.bytes);
    const finalizedBlockHeight = 10;
    return finalizedBlockHeight;
  }

  async getLastHeight(): Promise<number> {
    const baseurl = '/ext/index/C/block';
    const lastAccepted = await this.indexApi.getLastAccepted(
      this.encoding,
      baseurl,
    );
    const decrypted = this.bintools.cb58Decode(lastAccepted.bytes);
    const lastHeight = 10;
    return lastHeight;
  }

  async fetchBlocksBatches(bufferBlocks: number[]): Promise<any> {
    const baseurl = '/ext/index/C/block';
    const lastAccepted = await this.indexApi.getLastAccepted(
      this.encoding,
      baseurl,
    );
    const decrypted = this.bintools.cb58Decode(lastAccepted.bytes);
    return this.genesisBlock.bytes;
  }
}
