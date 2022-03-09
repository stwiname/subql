// Copyright 2020-2022 OnFinality Limited authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Injectable, OnApplicationShutdown } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { BlockHash } from '@polkadot/types/interfaces';
import { RegisteredTypes } from '@polkadot/types/types';
import { ProjectNetworkConfig } from '@subql/common';
import { ApiWrapper } from '@subql/types';
import { SubqueryProject } from '../configure/SubqueryProject';
import { getLogger } from '../utils/logger';
import { AlgorandApi } from './api.algorand';
import { AvalancheApi } from './api.avalanche';
import { SubstrateApi } from './api.substrate';
import { NetworkMetadataPayload } from './events';
import { ApiAt } from './types';

const logger = getLogger('api');

@Injectable()
export class ApiService implements OnApplicationShutdown {
  private api: ApiWrapper;
  networkMeta: NetworkMetadataPayload;

  constructor(
    protected project: SubqueryProject,
    private eventEmitter: EventEmitter2,
  ) {}

  async onApplicationShutdown(): Promise<void> {
    if (this.project.network.type === 'substrate' && this.api) {
      const substrateApi = this.api as SubstrateApi;
      await Promise.all([substrateApi.disconnect()]);
    }
  }

  async init(): Promise<ApiService> {
    try {
      let chainTypes: RegisteredTypes;
      let network: Partial<ProjectNetworkConfig>;
      try {
        chainTypes = this.project.chainTypes;
        network = this.project.network;
      } catch (e) {
        logger.error(Object.keys(e));
        process.exit(1);
      }
      logger.info(JSON.stringify(this.project.network));

      switch (network.type) {
        case 'substrate': {
          this.api = new SubstrateApi(network, chainTypes, this.eventEmitter);
          break;
        }
        case 'algorand': {
          this.api = new AlgorandApi({
            token: network.token,
            server: network.endpoint,
            port: network.port,
          });
          break;
        }
        case 'avalanche': {
          this.api = new AvalancheApi({
            ip: network.endpoint,
            port: network.port,
            token: network.token,
            chainName: network.chainName,
          });
          break;
        }
        default: {
          const err = new Error(
            `Network type doesn't match any of our supported networks. supported: { substrate, algorand, avalanche } actual="${network.type}`,
          );
          logger.error(err, err.message);
          throw err;
        }
      }

      await this.api.init();

      this.networkMeta = {
        chain: this.api.getRuntimeChain(),
        specName: this.api.getSpecName(),
        genesisHash: this.api.getGenesisHash(),
      };

      if (
        network.genesisHash &&
        network.genesisHash !== this.networkMeta.genesisHash
      ) {
        const err = new Error(
          `Network genesisHash doesn't match expected genesisHash. expected="${network.genesisHash}" actual="${this.networkMeta.genesisHash}`,
        );
        logger.error(err, err.message);
        throw err;
      }

      return this;
    } catch (e) {
      console.log(e);
      throw e;
    }
  }

  getApi(): ApiWrapper {
    return this.api;
  }

  async getPatchedApi(
    blockHash: string | BlockHash,
    blockNumber: number,
    parentBlockHash?: BlockHash,
  ): Promise<ApiAt> {
    const substrateApi = this.api as SubstrateApi;
    const patchedApi = await substrateApi.getPatchedApi(
      blockHash,
      blockNumber,
      parentBlockHash,
    );
    return patchedApi;
  }
}
