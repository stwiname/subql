// Copyright 2020-2022 OnFinality Limited authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { ApiPromise } from '@polkadot/api';
import { ApiDecoration } from '@polkadot/api/types';
import { Entity } from '@subql/types';
import algosdk from 'algosdk';

export type ApiAt = ApiDecoration<'promise'> & { rpc: ApiPromise['rpc'] };

/****************************************************/
/*             ALGORAND SPECIFIC TYPES              */
/****************************************************/

export type AlgorandOptions = {
  token: string;
  server: string;
  port: number;
};

export interface AlgorandApi {
  client: algosdk.Algodv2;
  lastHeader: any; // Record<string, Buffer | number | string>;
}

/****************************************************/
/*             AVALANCHE SPECIFIC TYPES             */
/****************************************************/

export type AvalancheOptions = {
  ip: string;
  port: number;
  token: string;
  chainName: string; // XV | XT | C | P
};

/****************************************************/
/*             SUBSTRATE SPECIFIC TYPES             */
/****************************************************/

export enum OperationType {
  Set = 'Set',
  Remove = 'Remove',
}

export type OperationEntity = {
  operation: OperationType;
  entityType: string;
  data: Entity | string;
};
