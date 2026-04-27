import { describe, expect, it } from 'vitest';
import type { StateStorage } from 'zustand/middleware';

import {
  createBufferJSONStorage,
  createBufferStore,
} from '../../../../../src/features/buffer/core/model/create-buffer-store.ts';

function createMemoryStateStorage(
  seed: Record<string, string> = {}
): StateStorage & { snapshot: () => Record<string, string> } {
  const values = new Map(Object.entries(seed));

  return {
    getItem: (name): string | null => values.get(name) ?? null,
    removeItem: (name): void => {
      values.delete(name);
    },
    setItem: (name, value): void => {
      values.set(name, value);
    },
    snapshot: (): Record<string, string> =>
      Object.fromEntries(values.entries()),
  };
}

describe('createBufferStore', () => {
  it('adds a trimmed item in capture order', () => {
    const store = createBufferStore({
      storage: createBufferJSONStorage(createMemoryStateStorage()),
    });

    const result = store.getState().addItem({
      value: '  QR-001  ',
      capturedAt: '2026-04-21T10:00:00.000Z',
      kind: 'qr',
      source: 'scanner',
    });

    expect(result.code).toBe('added');
    expect(store.getState().items).toHaveLength(1);
    expect(store.getState().items[0]).toMatchObject({
      value: 'QR-001',
      normalizedValue: 'qr-001',
      capturedAt: '2026-04-21T10:00:00.000Z',
      kind: 'qr',
      source: 'scanner',
    });
  });

  it('reports duplicate add without mutating canonical truth', () => {
    const store = createBufferStore({
      storage: createBufferJSONStorage(createMemoryStateStorage()),
    });

    store.getState().addItem({
      value: 'ABC-123',
      capturedAt: '2026-04-21T10:00:00.000Z',
    });

    const result = store.getState().addItem({
      value: '  abc-123  ',
      capturedAt: '2026-04-21T10:01:00.000Z',
    });

    expect(result).toMatchObject({
      code: 'duplicate',
      normalizedValue: 'abc-123',
    });
    expect(store.getState().items).toHaveLength(1);
  });

  it('evicts the oldest item on FIFO overflow and reports it', () => {
    const store = createBufferStore({
      maxItems: 2,
      storage: createBufferJSONStorage(createMemoryStateStorage()),
    });

    const first = store.getState().addItem({
      value: 'first',
      capturedAt: '2026-04-21T10:00:00.000Z',
    });
    store.getState().addItem({
      value: 'second',
      capturedAt: '2026-04-21T10:01:00.000Z',
    });
    const overflow = store.getState().addItem({
      value: 'third',
      capturedAt: '2026-04-21T10:02:00.000Z',
    });

    expect(first.code).toBe('added');
    expect(overflow).toMatchObject({
      code: 'added-with-eviction',
    });

    if (overflow.code !== 'added-with-eviction' || first.code !== 'added') {
      throw new Error('Expected deterministic add results');
    }

    expect(overflow.evictedItem.id).toBe(first.item.id);
    expect(store.getState().items.map((item) => item.value)).toEqual([
      'second',
      'third',
    ]);
  });

  it('updates an item by id without changing capture order', () => {
    const store = createBufferStore({
      storage: createBufferJSONStorage(createMemoryStateStorage()),
    });

    const added = store.getState().addItem({
      value: 'draft',
      capturedAt: '2026-04-21T10:00:00.000Z',
    });
    if (added.code !== 'added') {
      throw new Error('Expected add success');
    }

    const result = store.getState().updateItem({
      id: added.item.id,
      value: 'draft-updated',
      source: 'manual',
    });

    expect(result).toMatchObject({
      code: 'updated',
    });
    expect(store.getState().items[0]).toMatchObject({
      id: added.item.id,
      value: 'draft-updated',
      normalizedValue: 'draft-updated',
      capturedAt: '2026-04-21T10:00:00.000Z',
      source: 'manual',
    });
  });

  it('deletes an item by id', () => {
    const store = createBufferStore({
      storage: createBufferJSONStorage(createMemoryStateStorage()),
    });

    const added = store.getState().addItem({
      value: 'delete-me',
      capturedAt: '2026-04-21T10:00:00.000Z',
    });
    if (added.code !== 'added') {
      throw new Error('Expected add success');
    }

    const result = store.getState().deleteItem(added.item.id);

    expect(result).toMatchObject({
      code: 'deleted',
    });
    expect(store.getState().items).toEqual([]);
  });

  it('clears all items and reports how many were removed', () => {
    const store = createBufferStore({
      storage: createBufferJSONStorage(createMemoryStateStorage()),
    });

    store.getState().addItems([
      {
        value: 'one',
        capturedAt: '2026-04-21T10:00:00.000Z',
      },
      {
        value: 'two',
        capturedAt: '2026-04-21T10:01:00.000Z',
      },
    ]);

    const result = store.getState().clear();

    expect(result).toEqual({
      clearedCount: 2,
    });
    expect(store.getState().items).toEqual([]);
  });

  it('persists only canonical buffer truth and hydrates it back safely', () => {
    const storage = createMemoryStateStorage();
    const persistName = 'test-buffer-persist';
    const writerStore = createBufferStore({
      persistName,
      storage: createBufferJSONStorage(storage),
    });

    writerStore.getState().addItem({
      value: 'persist-me',
      capturedAt: '2026-04-21T10:00:00.000Z',
      kind: 'barcode',
    });

    const rawPersistedValue = storage.snapshot()[persistName];
    expect(rawPersistedValue).toBeDefined();

    const parsedPersistedValue = JSON.parse(rawPersistedValue);
    expect(parsedPersistedValue).toEqual({
      state: {
        items: [
          expect.objectContaining({
            value: 'persist-me',
            normalizedValue: 'persist-me',
            capturedAt: '2026-04-21T10:00:00.000Z',
            kind: 'barcode',
          }),
        ],
      },
      version: 1,
    });

    const hydratedStore = createBufferStore({
      persistName,
      storage: createBufferJSONStorage(storage),
    });

    expect(hydratedStore.getState().items).toHaveLength(1);
    expect(hydratedStore.getState().items[0]).toMatchObject({
      value: 'persist-me',
      normalizedValue: 'persist-me',
      capturedAt: '2026-04-21T10:00:00.000Z',
      kind: 'barcode',
    });
  });
});
