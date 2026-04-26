import { describe, expect, it } from 'vitest';
import type { StateStorage } from 'zustand/middleware';

import { createBufferControlController } from '../../../../../src/features/buffer-core/model/buffer-control.controller.ts';
import { createBufferControlSessionStore } from '../../../../../src/features/buffer-core/model/buffer-control.session-store.ts';
import {
  createBufferJSONStorage,
  createBufferStore,
} from '../../../../../src/features/buffer-core/model/create-buffer-store.ts';

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

function createController() {
  const bufferControlSessionStore = createBufferControlSessionStore();

  return createBufferControlController({
    bufferControlSessionStore,
  });
}

describe('createBufferControlController', () => {
  it('acquires a lease when no control owner is active', () => {
    const controller = createController();

    const result = controller.acquireControl({
      owner: {
        kind: 'buffer-page',
      },
      mode: 'manage',
    });

    expect(result).toMatchObject({
      code: 'acquired',
      lease: {
        owner: {
          kind: 'buffer-page',
          context: null,
        },
        mode: 'manage',
      },
    });
    expect(controller.getCurrentLease()).toMatchObject({
      owner: {
        kind: 'buffer-page',
      },
      mode: 'manage',
    });
  });

  it('returns a no-op result when the same owner already holds the same control mode', () => {
    const controller = createController();
    const acquired = controller.acquireControl({
      owner: {
        kind: 'arrival-form',
        context: {
          recordId: 'arrival-1',
          source: 'edit',
        },
      },
      mode: 'apply',
    });
    if (acquired.code !== 'acquired') {
      throw new Error('Expected deterministic initial lease');
    }

    const result = controller.acquireControl({
      owner: {
        kind: 'arrival-form',
        context: {
          recordId: 'arrival-1',
          source: 'edit',
        },
      },
      mode: 'apply',
    });

    expect(result).toEqual({
      code: 'noop-already-held',
      lease: acquired.lease,
    });
  });

  it('reports a conflict when another orchestration owner requests exclusive control', () => {
    const controller = createController();
    controller.acquireControl({
      owner: {
        kind: 'buffer-page',
      },
      mode: 'manage',
    });

    const result = controller.acquireControl({
      owner: {
        kind: 'departure-form',
        context: {
          recordId: 'departure-1',
          source: 'create',
        },
      },
      mode: 'apply',
    });

    expect(result).toMatchObject({
      code: 'lease-conflict',
      requestedOwner: {
        kind: 'departure-form',
        context: {
          recordId: 'departure-1',
          source: 'create',
        },
      },
      requestedMode: 'apply',
      currentLease: {
        owner: {
          kind: 'buffer-page',
        },
        mode: 'manage',
      },
    });
  });

  it('releases the lease only when the current owner matches', () => {
    const controller = createController();
    const acquired = controller.acquireControl({
      owner: {
        kind: 'draft-form',
        context: {
          recordId: 'draft-1',
          source: 'edit',
        },
      },
      mode: 'apply',
    });
    if (acquired.code !== 'acquired') {
      throw new Error('Expected deterministic initial lease');
    }

    const result = controller.releaseControl({
      owner: {
        kind: 'draft-form',
        context: {
          recordId: 'draft-1',
          source: 'edit',
        },
      },
    });

    expect(result).toEqual({
      code: 'released',
      releasedLease: acquired.lease,
    });
    expect(controller.getCurrentLease()).toBeNull();
  });

  it('rejects release attempts from a different owner', () => {
    const controller = createController();
    controller.acquireControl({
      owner: {
        kind: 'arrival-form',
        context: {
          recordId: 'arrival-1',
          source: 'create',
        },
      },
      mode: 'apply',
    });

    const result = controller.releaseControl({
      owner: {
        kind: 'departure-form',
        context: {
          recordId: 'departure-1',
          source: 'create',
        },
      },
    });

    expect(result).toMatchObject({
      code: 'owner-mismatch',
      owner: {
        kind: 'departure-form',
      },
      currentLease: {
        owner: {
          kind: 'arrival-form',
        },
        mode: 'apply',
      },
    });
  });

  it('transfers control explicitly from manage to apply without changing buffer data ownership', () => {
    const controller = createController();
    const bufferStore = createBufferStore({
      storage: createBufferJSONStorage(createMemoryStateStorage()),
    });
    bufferStore.getState().addItem({
      value: 'QR-001',
      capturedAt: '2026-04-21T10:00:00.000Z',
    });
    const initialItems = bufferStore.getState().items;

    const acquired = controller.acquireControl({
      owner: {
        kind: 'buffer-page',
      },
      mode: 'manage',
    });
    if (acquired.code !== 'acquired') {
      throw new Error('Expected deterministic initial lease');
    }

    const result = controller.transferControl({
      fromOwner: {
        kind: 'buffer-page',
      },
      toOwner: {
        kind: 'arrival-form',
        context: {
          recordId: 'arrival-1',
          source: 'picker',
        },
      },
      toMode: 'apply',
    });

    expect(result).toMatchObject({
      code: 'transferred',
      previousLease: {
        owner: {
          kind: 'buffer-page',
        },
        mode: 'manage',
      },
      lease: {
        owner: {
          kind: 'arrival-form',
          context: {
            recordId: 'arrival-1',
            source: 'picker',
          },
        },
        mode: 'apply',
      },
    });
    expect(bufferStore.getState().items).toEqual(initialItems);
  });

  it('reports owner mismatch when transfer is attempted by a non-holder', () => {
    const controller = createController();
    controller.acquireControl({
      owner: {
        kind: 'buffer-page',
      },
      mode: 'manage',
    });

    const result = controller.transferControl({
      fromOwner: {
        kind: 'arrival-form',
      },
      toOwner: {
        kind: 'departure-form',
      },
      toMode: 'apply',
    });

    expect(result).toMatchObject({
      code: 'owner-mismatch',
      fromOwner: {
        kind: 'arrival-form',
      },
      currentLease: {
        owner: {
          kind: 'buffer-page',
        },
      },
    });
  });
});
