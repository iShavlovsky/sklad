import type { StateStorage } from 'zustand/middleware';
import { createJSONStorage, persist } from 'zustand/middleware';
import { createStore } from 'zustand/vanilla';

import { createBufferItem, normalizeBufferItemValue } from './buffer-item.ts';
import type {
  BufferAddItemsResult,
  BufferAddResult,
  BufferClearResult,
  BufferDeleteManyResult,
  BufferDeleteResult,
  BufferPersistedState,
  BufferStore,
  BufferStoreState,
  BufferUpdateResult,
  CreateBufferStoreOptions,
} from './buffer-store.types.ts';
import {
  BUFFER_STORE_PERSIST_NAME,
  BUFFER_STORE_VERSION,
  DEFAULT_BUFFER_MAX_ITEMS,
} from './buffer-store.types.ts';

function createBufferPersistedState(
  persistedState: unknown
): BufferPersistedState {
  if (
    typeof persistedState === 'object' &&
    persistedState !== null &&
    'items' in persistedState &&
    Array.isArray((persistedState as { items: unknown }).items)
  ) {
    return {
      items: (persistedState as BufferPersistedState).items,
    };
  }

  return {
    items: [],
  };
}

function requireBufferStorage(
  storage: CreateBufferStoreOptions['storage']
): NonNullable<CreateBufferStoreOptions['storage']> {
  if (storage === undefined) {
    throw new Error('Buffer persist storage is unavailable.');
  }

  return storage;
}

function resolveBufferStorage(
  storage?: CreateBufferStoreOptions['storage']
): NonNullable<CreateBufferStoreOptions['storage']> {
  if (storage !== undefined) {
    return storage;
  }

  return requireBufferStorage(
    createJSONStorage<BufferPersistedState>(() => localStorage)
  );
}

export function createBufferJSONStorage(
  storage: StateStorage
): NonNullable<CreateBufferStoreOptions['storage']> {
  return requireBufferStorage(
    createJSONStorage<BufferPersistedState>(() => storage)
  );
}

export function createBufferStore(
  options: CreateBufferStoreOptions = {}
): BufferStore {
  const maxItems = options.maxItems ?? DEFAULT_BUFFER_MAX_ITEMS;
  const persistName = options.persistName ?? BUFFER_STORE_PERSIST_NAME;
  const storage = resolveBufferStorage(options.storage);

  return createStore<BufferStoreState>()(
    persist(
      (set, get) => ({
        items: [],
        addItem: (input): BufferAddResult => {
          const item = createBufferItem(input);
          if (item === null) {
            return {
              code: 'empty-value',
            };
          }

          const existingItem = get().items.find(
            (bufferItem) => bufferItem.normalizedValue === item.normalizedValue
          );
          if (existingItem !== undefined) {
            return {
              code: 'duplicate',
              existingItem,
              normalizedValue: item.normalizedValue,
            };
          }

          const nextItems = [...get().items, item];
          if (nextItems.length > maxItems) {
            const [evictedItem, ...retainedItems] = nextItems;
            set({
              items: retainedItems,
            });

            return {
              code: 'added-with-eviction',
              evictedItem,
              item,
            };
          }

          set({
            items: nextItems,
          });

          return {
            code: 'added',
            item,
          };
        },
        addItems: (inputs): BufferAddItemsResult => {
          const results = inputs.map((input) => get().addItem(input));

          return {
            addedCount: results.filter(
              (result) =>
                result.code === 'added' || result.code === 'added-with-eviction'
            ).length,
            duplicateCount: results.filter(
              (result) => result.code === 'duplicate'
            ).length,
            emptyValueCount: results.filter(
              (result) => result.code === 'empty-value'
            ).length,
            evictedItems: results.flatMap((result) =>
              result.code === 'added-with-eviction' ? [result.evictedItem] : []
            ),
            results,
          };
        },
        updateItem: (input): BufferUpdateResult => {
          const index = get().items.findIndex((item) => item.id === input.id);
          if (index === -1) {
            return {
              code: 'not-found',
              id: input.id,
            };
          }

          const normalizedValue = normalizeBufferItemValue(input.value);
          if (normalizedValue === null) {
            return {
              code: 'empty-value',
              id: input.id,
            };
          }

          const existingItem = get().items.find(
            (item) =>
              item.id !== input.id && item.normalizedValue === normalizedValue
          );
          if (existingItem !== undefined) {
            return {
              code: 'duplicate',
              existingItem,
              id: input.id,
              normalizedValue,
            };
          }

          const currentItem = get().items[index];
          const updatedItem = {
            ...currentItem,
            value: input.value.trim(),
            normalizedValue,
            ...(input.kind ? { kind: input.kind } : {}),
            ...(input.kind === undefined ? { kind: currentItem.kind } : {}),
            ...(input.source ? { source: input.source } : {}),
            ...(input.source === undefined
              ? { source: currentItem.source }
              : {}),
          };

          const nextItems = [...get().items];
          nextItems[index] = updatedItem;

          set({
            items: nextItems,
          });

          return {
            code: 'updated',
            item: updatedItem,
          };
        },
        deleteItem: (id): BufferDeleteResult => {
          const deletedItem = get().items.find((item) => item.id === id);
          if (deletedItem === undefined) {
            return {
              code: 'not-found',
              id,
            };
          }

          set({
            items: get().items.filter((item) => item.id !== id),
          });

          return {
            code: 'deleted',
            deletedItem,
          };
        },
        deleteItems: (ids): BufferDeleteManyResult => {
          const idSet = new Set(ids);
          const deletedItems = get().items.filter((item) => idSet.has(item.id));
          const retainedItems = get().items.filter(
            (item) => !idSet.has(item.id)
          );
          const deletedIdSet = new Set(deletedItems.map((item) => item.id));

          set({
            items: retainedItems,
          });

          return {
            deletedCount: deletedItems.length,
            deletedItems,
            missingIds: ids.filter((id) => !deletedIdSet.has(id)),
          };
        },
        clear: (): BufferClearResult => {
          const clearedCount = get().items.length;
          set({
            items: [],
          });

          return {
            clearedCount,
          };
        },
      }),
      {
        name: persistName,
        partialize: (state): BufferPersistedState => ({
          items: state.items,
        }),
        version: BUFFER_STORE_VERSION,
        migrate: (persistedState): BufferPersistedState =>
          createBufferPersistedState(persistedState),
        storage,
      }
    )
  );
}
