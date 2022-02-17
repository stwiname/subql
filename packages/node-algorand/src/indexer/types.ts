// Copyright 2020-2022 OnFinality Limited authors & contributors
// SPDX-License-Identifier: Apache-2.0

import {
  Entity,
  SubstrateBlock,
  SubstrateEvent,
  SubstrateExtrinsic,
} from '@subql/types';
import algosdk from 'algosdk';

export interface BlockContent {
  block: SubstrateBlock;
  extrinsics: SubstrateExtrinsic[];
  events: SubstrateEvent[];
}

export enum OperationType {
  Set = 'Set',
  Remove = 'Remove',
}

export type OperationEntity = {
  operation: OperationType;
  entityType: string;
  data: Entity | string;
};

export type ApiAt = algosdk.Algodv2
