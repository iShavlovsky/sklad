import type { StoreApi } from 'zustand';
import type { PersistStorage } from 'zustand/middleware';

import type { BufferItem, CreateBufferItemInput } from './buffer-item.ts';

export const BUFFER_STORE_PERSIST_NAME = 'sklad-buffer';
export const BUFFER_STORE_VERSION = 1;
export const DEFAULT_BUFFER_MAX_ITEMS = 100;

export interface BufferPersistedState {
  items: BufferItem[];
}

/** Canonical singleton buffer truth only; sort/filter/view selection stay outside this store. */
export interface BufferStoreState extends BufferPersistedState {
  addItem: (input: CreateBufferItemInput) => BufferAddResult;
  addItems: (inputs: CreateBufferItemInput[]) => BufferAddItemsResult;
  updateItem: (input: UpdateBufferItemInput) => BufferUpdateResult;
  deleteItem: (id: string) => BufferDeleteResult;
  deleteItems: (ids: string[]) => BufferDeleteManyResult;
  clear: () => BufferClearResult;
}

export interface CreateBufferStoreOptions {
  maxItems?: number;
  persistName?: string;
  storage?: PersistStorage<BufferPersistedState>;
}

export interface UpdateBufferItemInput {
  id: string;
  value: string;
  kind?: string;
  source?: string;
}

export type BufferAddResult =
  | {
      code: 'added';
      item: BufferItem;
    }
  | {
      code: 'added-with-eviction';
      evictedItem: BufferItem;
      item: BufferItem;
    }
  | {
      code: 'duplicate';
      existingItem: BufferItem;
      normalizedValue: string;
    }
  | {
      code: 'empty-value';
    };

export interface BufferAddItemsResult {
  addedCount: number;
  duplicateCount: number;
  emptyValueCount: number;
  evictedItems: BufferItem[];
  results: BufferAddResult[];
}

export type BufferUpdateResult =
  | {
      code: 'updated';
      item: BufferItem;
    }
  | {
      code: 'not-found';
      id: string;
    }
  | {
      code: 'empty-value';
      id: string;
    }
  | {
      code: 'duplicate';
      existingItem: BufferItem;
      id: string;
      normalizedValue: string;
    };

export type BufferDeleteResult =
  | {
      code: 'deleted';
      deletedItem: BufferItem;
    }
  | {
      code: 'not-found';
      id: string;
    };

export interface BufferDeleteManyResult {
  deletedCount: number;
  deletedItems: BufferItem[];
  missingIds: string[];
}

export interface BufferClearResult {
  clearedCount: number;
}

export type BufferStore = StoreApi<BufferStoreState>;
