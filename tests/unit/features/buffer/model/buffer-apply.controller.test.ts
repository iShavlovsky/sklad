import { describe, expect, it } from 'vitest';
import type { StateStorage } from 'zustand/middleware';

import { createBufferApplyController } from '../../../../../src/features/buffer/core/model/buffer-apply.controller.ts';
import { createBufferApplySessionStore } from '../../../../../src/features/buffer/core/model/buffer-apply.session-store.ts';
import { createBufferControlController } from '../../../../../src/features/buffer/core/model/buffer-control.controller.ts';
import { createBufferControlSessionStore } from '../../../../../src/features/buffer/core/model/buffer-control.session-store.ts';
import {
  createBufferJSONStorage,
  createBufferStore,
} from '../../../../../src/features/buffer/core/model/create-buffer-store.ts';
import { createOverlayArbitrationStore } from '../../../../../src/features/navigation/model/create-overlay-arbitration-store.ts';

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
  const bufferStore = createBufferStore({
    storage: createBufferJSONStorage(createMemoryStateStorage()),
  });
  const bufferApplySessionStore = createBufferApplySessionStore();
  const bufferControlController = createBufferControlController({
    bufferControlSessionStore: createBufferControlSessionStore(),
  });
  const overlayArbitrationStore = createOverlayArbitrationStore();

  return createBufferApplyController({
    bufferStore,
    bufferApplySessionStore,
    bufferControlController,
    overlayArbitrationStore,
  });
}

describe('createBufferApplyController', () => {
  it('opens the buffer picker through overlay arbitration and stores the request payload outside overlay state', () => {
    const controller = createController();

    const result = controller.openPicker({
      requester: {
        kind: 'arrival-form',
        context: {
          recordId: 'arrival-1',
          source: 'edit',
        },
      },
      selectionMode: 'multiple',
      targetField: 'codes',
    });

    expect(result).toMatchObject({
      code: 'opened',
      controlResult: {
        code: 'acquired',
        lease: {
          owner: {
            kind: 'arrival-form',
            context: {
              recordId: 'arrival-1',
              source: 'edit',
            },
          },
          mode: 'apply',
        },
      },
      overlay: {
        id: 'buffer-picker',
        kind: 'modal',
      },
      request: {
        requester: {
          kind: 'arrival-form',
          context: {
            recordId: 'arrival-1',
            source: 'edit',
          },
        },
        selectionMode: 'multiple',
        targetField: 'codes',
        transferMode: 'copy',
      },
    });
    expect(
      controller.dependencies.overlayArbitrationStore.getState().currentOverlay
    ).toEqual({
      id: 'buffer-picker',
      kind: 'modal',
    });
    expect(
      controller.dependencies.overlayArbitrationStore.getState().currentOverlay
    ).not.toHaveProperty('requester');
    expect(
      controller.dependencies.bufferApplySessionStore.getState().currentRequest
    ).toMatchObject({
      requester: {
        kind: 'arrival-form',
      },
      transferMode: 'copy',
    });
  });

  it('reports overlay conflict without opening a buffer-apply session', () => {
    const controller = createController();
    controller.dependencies.overlayArbitrationStore.getState().openOverlay({
      id: 'scanner-session',
      kind: 'modal',
    });

    const result = controller.openPicker({
      requester: {
        kind: 'departure-form',
      },
      targetField: 'codes',
    });

    expect(result).toMatchObject({
      code: 'overlay-conflict',
      controlResult: {
        code: 'acquired',
      },
      overlayResult: {
        code: 'conflict',
      },
    });
    expect(
      controller.dependencies.bufferApplySessionStore.getState()
    ).toMatchObject({
      isOpen: false,
      currentRequest: null,
      lastResult: null,
    });
  });

  it('reports a control conflict without opening a buffer-apply session', () => {
    const controller = createController();
    controller.dependencies.bufferControlController.acquireControl({
      owner: {
        kind: 'buffer-page',
      },
      mode: 'manage',
    });

    const result = controller.openPicker({
      requester: {
        kind: 'departure-form',
      },
      targetField: 'codes',
    });

    expect(result).toMatchObject({
      code: 'control-conflict',
      controlResult: {
        code: 'lease-conflict',
        currentLease: {
          owner: {
            kind: 'buffer-page',
          },
          mode: 'manage',
        },
      },
    });
    expect(
      controller.dependencies.bufferApplySessionStore.getState()
    ).toMatchObject({
      isOpen: false,
      currentRequest: null,
      lastResult: null,
    });
  });

  it('applies selected buffer items by copy and keeps canonical buffer items intact', () => {
    const controller = createController();
    const firstAdd = controller.dependencies.bufferStore.getState().addItem({
      value: 'QR-001',
      capturedAt: '2026-04-21T10:00:00.000Z',
      kind: 'qr',
      source: 'scanner-photo',
    });
    const secondAdd = controller.dependencies.bufferStore.getState().addItem({
      value: 'QR-002',
      capturedAt: '2026-04-21T10:01:00.000Z',
      kind: 'qr',
      source: 'scanner-live',
    });
    if (firstAdd.code !== 'added' || secondAdd.code !== 'added') {
      throw new Error('Expected deterministic buffer setup');
    }

    controller.openPicker({
      requester: {
        kind: 'draft-form',
      },
      selectionMode: 'multiple',
      targetField: 'codes',
    });

    const result = controller.applySelectedItems({
      selectedItemIds: [firstAdd.item.id, secondAdd.item.id],
    });

    expect(result).toMatchObject({
      code: 'applied',
      controlReleaseResult: {
        code: 'released',
        releasedLease: {
          owner: {
            kind: 'draft-form',
            context: null,
          },
          mode: 'apply',
        },
      },
      result: {
        code: 'applied',
        transferMode: 'copy',
        selectedItemIds: [firstAdd.item.id, secondAdd.item.id],
        copiedValues: [
          {
            bufferItemId: firstAdd.item.id,
            value: 'QR-001',
            capturedAt: '2026-04-21T10:00:00.000Z',
            kind: 'qr',
            source: 'scanner-photo',
          },
          {
            bufferItemId: secondAdd.item.id,
            value: 'QR-002',
            capturedAt: '2026-04-21T10:01:00.000Z',
            kind: 'qr',
            source: 'scanner-live',
          },
        ],
      },
      clearedPickerOverlay: true,
    });
    expect(controller.dependencies.bufferStore.getState().items).toHaveLength(
      2
    );
    expect(
      controller.dependencies.bufferApplySessionStore.getState()
    ).toMatchObject({
      isOpen: false,
      currentRequest: null,
      lastResult: {
        code: 'applied',
        transferMode: 'copy',
      },
    });
    expect(
      controller.dependencies.overlayArbitrationStore.getState().currentOverlay
    ).toBeNull();
  });

  it('rejects single-selection requests that try to apply multiple ids', () => {
    const controller = createController();
    const firstAdd = controller.dependencies.bufferStore.getState().addItem({
      value: 'A',
    });
    const secondAdd = controller.dependencies.bufferStore.getState().addItem({
      value: 'B',
    });
    if (firstAdd.code !== 'added' || secondAdd.code !== 'added') {
      throw new Error('Expected deterministic buffer setup');
    }

    controller.openPicker({
      requester: {
        kind: 'arrival-form',
      },
      selectionMode: 'single',
      targetField: 'codes',
    });

    const result = controller.applySelectedItems({
      selectedItemIds: [firstAdd.item.id, secondAdd.item.id],
    });

    expect(result).toMatchObject({
      code: 'selection-mode-mismatch',
      selectedItemIds: [firstAdd.item.id, secondAdd.item.id],
    });
    expect(
      controller.dependencies.bufferApplySessionStore.getState()
    ).toMatchObject({
      isOpen: true,
      currentRequest: expect.objectContaining({
        selectionMode: 'single',
      }),
      lastResult: null,
    });
  });

  it('reports missing buffer items explicitly without closing the picker session', () => {
    const controller = createController();
    const added = controller.dependencies.bufferStore.getState().addItem({
      value: 'EXISTING',
    });
    if (added.code !== 'added') {
      throw new Error('Expected deterministic buffer setup');
    }

    controller.openPicker({
      requester: {
        kind: 'departure-form',
      },
      targetField: 'codes',
    });

    const result = controller.applySelectedItems({
      selectedItemIds: [added.item.id, 'missing-item-id'],
    });

    expect(result).toMatchObject({
      code: 'items-missing',
      missingItemIds: ['missing-item-id'],
    });
    expect(
      controller.dependencies.bufferApplySessionStore.getState().isOpen
    ).toBe(true);
    expect(
      controller.dependencies.overlayArbitrationStore.getState().currentOverlay
    ).toEqual({
      id: 'buffer-picker',
      kind: 'modal',
    });
  });

  it('cancels the picker and preserves a machine-readable cancelled result for the caller', () => {
    const controller = createController();

    const opened = controller.openPicker({
      requester: {
        kind: 'arrival-form',
      },
      targetField: 'codes',
    });
    if (opened.code !== 'opened') {
      throw new Error('Expected picker to open');
    }

    const result = controller.cancelPicker();

    expect(result).toEqual({
      code: 'cancelled',
      controlReleaseResult: {
        code: 'released',
        releasedLease: {
          leaseId: expect.any(String),
          owner: {
            kind: 'arrival-form',
            context: null,
          },
          mode: 'apply',
        },
      },
      result: {
        code: 'cancelled',
        requestId: opened.request.requestId,
        transferMode: 'copy',
      },
      clearedPickerOverlay: true,
    });
    expect(
      controller.dependencies.bufferApplySessionStore.getState()
    ).toMatchObject({
      isOpen: false,
      currentRequest: null,
      lastResult: {
        code: 'cancelled',
        requestId: opened.request.requestId,
        transferMode: 'copy',
      },
    });
  });
});
