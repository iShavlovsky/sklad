import { describe, expect, it } from 'vitest';
import type { StateStorage } from 'zustand/middleware';

import { createBufferControlController } from '../../../../../src/features/buffer/core/model/buffer-control.controller.ts';
import { createBufferControlSessionStore } from '../../../../../src/features/buffer/core/model/buffer-control.session-store.ts';
import {
  createBufferJSONStorage,
  createBufferStore,
} from '../../../../../src/features/buffer/core/model/create-buffer-store.ts';
import { createOverlayArbitrationStore } from '../../../../../src/features/navigation/model/create-overlay-arbitration-store.ts';
import { createScannerSessionStore } from '../../../../../src/features/scanner/runtime/model/create-scanner-session-store.ts';
import { createScannerRuntimeController } from '../../../../../src/features/scanner/runtime/model/scanner-runtime-controller.ts';
import type {
  LiveScannerAdapter,
  StartLiveScannerSessionInput,
  StartLiveScannerSessionResult,
  StopLiveScannerSessionResult,
} from '../../../../../src/infrastructure/browser/scanner/adapters/live.ts';
import type { PhotoScannerAdapter } from '../../../../../src/infrastructure/browser/scanner/adapters/photo.ts';
import {
  createScannerDecodedResult,
  createScannerNoResult,
  createScannerRecoverableFailure,
} from '../../../../../src/infrastructure/browser/scanner/contracts/decode-result.ts';

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

function createPreviewElementStub(): HTMLVideoElement {
  return {} as HTMLVideoElement;
}

function createLiveScannerAdapterStub(
  overrides: Partial<LiveScannerAdapter> = {}
): LiveScannerAdapter {
  return {
    getCapability: async () => ({
      mode: 'live',
      supported: true,
      secureContext: true,
      permissionState: 'prompt',
      hasMediaDevicesApi: true,
      hasGetUserMedia: true,
      hasEnumerateDevices: true,
      availableCameras: [
        {
          deviceId: 'camera-1',
          label: 'Камера 1',
        },
      ],
      availableCameraCount: 1,
    }),
    startSession: async (
      _input: StartLiveScannerSessionInput
    ): Promise<StartLiveScannerSessionResult> => {
      let isActive = true;

      return {
        ok: true,
        code: 'STARTED',
        session: {
          kind: 'live',
          sessionId: 'live-session-1',
          stop: async (): Promise<StopLiveScannerSessionResult> => {
            if (!isActive) {
              return createScannerRecoverableFailure(
                'SESSION_NOT_ACTIVE',
                'No active live scanner session'
              );
            }

            isActive = false;

            return {
              ok: true,
              code: 'STOPPED',
              sessionId: 'live-session-1',
              reason: 'caller',
            };
          },
        },
      };
    },
    ...overrides,
  };
}

function createPhotoScannerAdapterStub(
  overrides: Partial<PhotoScannerAdapter> = {}
): PhotoScannerAdapter {
  return {
    getCapability: async () => ({
      mode: 'photo',
      supported: true,
      secureContext: true,
      permissionState: 'unknown',
      hasFileApi: true,
      hasObjectUrlApi: true,
      acceptedMimeTypes: ['image/*'],
      maxFileSizeBytes: 10 * 1024 * 1024,
    }),
    decodeFile: async () =>
      createScannerDecodedResult({
        value: 'PHOTO-123',
        capturedAt: '2026-04-21T00:00:00.000Z',
        format: 'QR_CODE',
        source: 'scanner-photo',
      }),
    ...overrides,
  };
}

function createBufferControlDependencies() {
  return createBufferControlController({
    bufferControlSessionStore: createBufferControlSessionStore(),
  });
}

describe('createScannerRuntimeController', () => {
  it('opens the scanner session through overlay arbitration', () => {
    const controller = createScannerRuntimeController({
      bufferStore: createBufferStore({
        storage: createBufferJSONStorage(createMemoryStateStorage()),
      }),
      bufferControlController: createBufferControlDependencies(),
      scannerSessionStore: createScannerSessionStore(),
      overlayArbitrationStore: createOverlayArbitrationStore(),
      liveScannerAdapter: createLiveScannerAdapterStub(),
      photoScannerAdapter: createPhotoScannerAdapterStub(),
    });

    const result = controller.openSession({
      entrypoint: 'arrival-form',
      context: {
        recordId: 'arrival-1',
        source: 'create',
      },
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
              source: 'create',
            },
          },
          mode: 'apply',
        },
      },
    });
    if (result.code !== 'opened') {
      throw new Error('Expected scanner session to open');
    }
    expect(result.overlayResult.code).toBe('opened');
    expect(
      controller.dependencies.overlayArbitrationStore.getState().currentOverlay
    ).toEqual({
      id: 'scanner-session',
      kind: 'modal',
    });
    expect(
      controller.dependencies.scannerSessionStore.getState()
    ).toMatchObject({
      isOpen: true,
      entrypoint: 'arrival-form',
      context: {
        recordId: 'arrival-1',
        source: 'create',
      },
    });
  });

  it('reports overlay conflict without reopening the scanner session', () => {
    const scannerSessionStore = createScannerSessionStore();
    const overlayArbitrationStore = createOverlayArbitrationStore();
    overlayArbitrationStore.getState().openOverlay({
      id: 'settings',
      kind: 'drawer',
    });

    const controller = createScannerRuntimeController({
      bufferStore: createBufferStore({
        storage: createBufferJSONStorage(createMemoryStateStorage()),
      }),
      bufferControlController: createBufferControlDependencies(),
      scannerSessionStore,
      overlayArbitrationStore,
      liveScannerAdapter: createLiveScannerAdapterStub(),
      photoScannerAdapter: createPhotoScannerAdapterStub(),
    });

    const result = controller.openSession({
      entrypoint: 'global',
    });

    expect(result).toMatchObject({
      code: 'overlay-conflict',
      controlResult: null,
      overlayResult: {
        code: 'conflict',
      },
    });
    expect(scannerSessionStore.getState().isOpen).toBe(false);
    expect(overlayArbitrationStore.getState().currentOverlay).toEqual({
      id: 'settings',
      kind: 'drawer',
    });
  });

  it('reports a control conflict without opening the scanner session', () => {
    const scannerSessionStore = createScannerSessionStore();
    const bufferControlController = createBufferControlDependencies();
    bufferControlController.acquireControl({
      owner: {
        kind: 'buffer-page',
      },
      mode: 'manage',
    });

    const controller = createScannerRuntimeController({
      bufferStore: createBufferStore({
        storage: createBufferJSONStorage(createMemoryStateStorage()),
      }),
      bufferControlController,
      scannerSessionStore,
      overlayArbitrationStore: createOverlayArbitrationStore(),
      liveScannerAdapter: createLiveScannerAdapterStub(),
      photoScannerAdapter: createPhotoScannerAdapterStub(),
    });

    const result = controller.openSession({
      entrypoint: 'departure-form',
      context: {
        recordId: 'departure-1',
        source: 'create',
      },
    });

    expect(result).toMatchObject({
      code: 'control-conflict',
      controlOwner: {
        kind: 'departure-form',
        context: {
          recordId: 'departure-1',
          source: 'create',
        },
      },
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
    expect(scannerSessionStore.getState().isOpen).toBe(false);
  });

  it('surfaces buffer eviction explicitly when a decoded value overflows the buffer', () => {
    const controller = createScannerRuntimeController({
      bufferStore: createBufferStore({
        maxItems: 1,
        storage: createBufferJSONStorage(createMemoryStateStorage()),
      }),
      bufferControlController: createBufferControlDependencies(),
      scannerSessionStore: createScannerSessionStore(),
      overlayArbitrationStore: createOverlayArbitrationStore(),
      liveScannerAdapter: createLiveScannerAdapterStub(),
      photoScannerAdapter: createPhotoScannerAdapterStub(),
    });

    controller.openSession({
      entrypoint: 'global',
    });

    controller.submitDecodedValue({
      value: 'first',
    });
    const result = controller.submitDecodedValue({
      value: 'second',
    });

    expect(result.code).toBe('submitted-with-eviction');
    if (result.code !== 'submitted-with-eviction') {
      throw new Error('Expected explicit eviction result');
    }

    expect(result.bufferResult).toMatchObject({
      code: 'added-with-eviction',
    });
    expect(result.bufferResult.evictedItem.value).toBe('first');
    expect(
      controller.dependencies.scannerSessionStore.getState().scanningStatus
    ).toBe('success');
  });

  it('surfaces duplicate decoded values explicitly as warning state with existing item details', () => {
    const controller = createScannerRuntimeController({
      bufferStore: createBufferStore({
        storage: createBufferJSONStorage(createMemoryStateStorage()),
      }),
      bufferControlController: createBufferControlDependencies(),
      scannerSessionStore: createScannerSessionStore(),
      overlayArbitrationStore: createOverlayArbitrationStore(),
      liveScannerAdapter: createLiveScannerAdapterStub(),
      photoScannerAdapter: createPhotoScannerAdapterStub(),
    });

    controller.openSession({
      entrypoint: 'global',
    });
    controller.submitDecodedValue({
      value: 'ABC-123',
      capturedAt: '2026-04-23T18:11:00.000Z',
      source: 'scanner-live',
    });

    const result = controller.submitDecodedValue({
      value: ' abc-123 ',
    });

    expect(result.code).toBe('duplicate');
    expect(
      controller.dependencies.scannerSessionStore.getState()
    ).toMatchObject({
      scanningStatus: 'warning',
      statusMessage:
        'Код abc-123 уже есть в буфере. Дата: 23.04.2026, 21:11. Тип: —. Откуда: Сканер.',
      errorCode: null,
    });
  });

  it('reports permission denial into scanner session status without browser APIs', () => {
    const controller = createScannerRuntimeController({
      bufferStore: createBufferStore({
        storage: createBufferJSONStorage(createMemoryStateStorage()),
      }),
      bufferControlController: createBufferControlDependencies(),
      scannerSessionStore: createScannerSessionStore(),
      overlayArbitrationStore: createOverlayArbitrationStore(),
      liveScannerAdapter: createLiveScannerAdapterStub(),
      photoScannerAdapter: createPhotoScannerAdapterStub(),
    });

    controller.openSession({
      entrypoint: 'global',
    });

    const result = controller.reportPermissionStatus({
      status: 'denied',
      message: 'Нет доступа к камере.',
    });

    expect(result).toEqual({
      code: 'permission-status-reported',
      status: 'denied',
    });
    expect(
      controller.dependencies.scannerSessionStore.getState()
    ).toMatchObject({
      permissionStatus: 'denied',
      scanningStatus: 'error',
      errorCode: 'permission-denied',
      errorMessage: 'Нет доступа к камере.',
    });
  });

  it('reports file selection rejection into scanner session status', () => {
    const controller = createScannerRuntimeController({
      bufferStore: createBufferStore({
        storage: createBufferJSONStorage(createMemoryStateStorage()),
      }),
      bufferControlController: createBufferControlDependencies(),
      scannerSessionStore: createScannerSessionStore(),
      overlayArbitrationStore: createOverlayArbitrationStore(),
      liveScannerAdapter: createLiveScannerAdapterStub(),
      photoScannerAdapter: createPhotoScannerAdapterStub(),
    });

    controller.openSession({
      entrypoint: 'global',
      activeTab: 'photo',
    });

    const result = controller.reportFileSelection({
      status: 'rejected-too-large',
      message: 'Файл слишком большой.',
    });

    expect(result).toEqual({
      code: 'file-selection-status-reported',
      status: 'rejected-too-large',
    });
    expect(
      controller.dependencies.scannerSessionStore.getState()
    ).toMatchObject({
      selectedFile: null,
      scanningStatus: 'error',
      errorCode: 'file-too-large',
      errorMessage: 'Файл слишком большой.',
    });
  });

  it('closes the scanner session and releases the scanner overlay', () => {
    const controller = createScannerRuntimeController({
      bufferStore: createBufferStore({
        storage: createBufferJSONStorage(createMemoryStateStorage()),
      }),
      bufferControlController: createBufferControlDependencies(),
      scannerSessionStore: createScannerSessionStore(),
      overlayArbitrationStore: createOverlayArbitrationStore(),
      liveScannerAdapter: createLiveScannerAdapterStub(),
      photoScannerAdapter: createPhotoScannerAdapterStub(),
    });

    controller.openSession({
      entrypoint: 'departure-form',
    });

    const result = controller.closeSession();

    expect(result).toMatchObject({
      code: 'closed',
      clearedScannerOverlay: true,
      controlReleaseResult: {
        code: 'released',
        releasedLease: {
          owner: {
            kind: 'departure-form',
            context: null,
          },
          mode: 'apply',
        },
      },
    });
    expect(
      controller.dependencies.overlayArbitrationStore.getState().currentOverlay
    ).toBeNull();
    expect(
      controller.dependencies.scannerSessionStore.getState()
    ).toMatchObject({
      isOpen: false,
      entrypoint: null,
      activeTab: 'live',
    });
  });

  it('starts live scanning through the injected adapter and submits decoded values to the buffer', async () => {
    let startInput: StartLiveScannerSessionInput | null = null;
    let stopCallCount = 0;

    const controller = createScannerRuntimeController({
      bufferStore: createBufferStore({
        storage: createBufferJSONStorage(createMemoryStateStorage()),
      }),
      bufferControlController: createBufferControlDependencies(),
      scannerSessionStore: createScannerSessionStore(),
      overlayArbitrationStore: createOverlayArbitrationStore(),
      liveScannerAdapter: createLiveScannerAdapterStub({
        startSession: async (input): Promise<StartLiveScannerSessionResult> => {
          startInput = input;
          await input.onDecode(
            createScannerDecodedResult({
              value: 'LIVE-123',
              capturedAt: '2026-04-21T00:00:00.000Z',
              format: 'QR_CODE',
              source: 'scanner-live',
            })
          );

          return {
            ok: true,
            code: 'STARTED',
            session: {
              kind: 'live',
              sessionId: 'live-session-1',
              stop: async (): Promise<StopLiveScannerSessionResult> => {
                stopCallCount += 1;

                return {
                  ok: true,
                  code: 'STOPPED',
                  sessionId: 'live-session-1',
                  reason: 'caller',
                };
              },
            },
          };
        },
      }),
      photoScannerAdapter: createPhotoScannerAdapterStub(),
    });

    controller.openSession({
      entrypoint: 'global',
      activeTab: 'live',
    });

    const result = await controller.startLiveScan({
      previewElement: createPreviewElementStub(),
    });

    expect(result.code).toBe('live-started');
    expect(startInput).not.toBeNull();
    expect(
      controller.dependencies.scannerSessionStore.getState()
    ).toMatchObject({
      permissionStatus: 'prompt',
      scanningStatus: 'success',
      errorCode: null,
    });
    expect(stopCallCount).toBe(1);
    expect(controller.dependencies.bufferStore.getState().items).toHaveLength(
      1
    );
    expect(
      controller.dependencies.bufferStore.getState().items[0]
    ).toMatchObject({
      value: 'LIVE-123',
      source: 'scanner-live',
    });
  });

  it('maps live adapter start failures into machine-readable session error state', async () => {
    const controller = createScannerRuntimeController({
      bufferStore: createBufferStore({
        storage: createBufferJSONStorage(createMemoryStateStorage()),
      }),
      bufferControlController: createBufferControlDependencies(),
      scannerSessionStore: createScannerSessionStore(),
      overlayArbitrationStore: createOverlayArbitrationStore(),
      liveScannerAdapter: createLiveScannerAdapterStub({
        startSession: async () =>
          createScannerRecoverableFailure(
            'CAMERA_PERMISSION_DENIED',
            'Camera permission was denied'
          ),
      }),
      photoScannerAdapter: createPhotoScannerAdapterStub(),
    });

    controller.openSession({
      entrypoint: 'global',
      activeTab: 'live',
    });

    const result = await controller.startLiveScan({
      previewElement: createPreviewElementStub(),
    });

    expect(result).toMatchObject({
      code: 'live-start-failed',
      adapterResult: {
        code: 'CAMERA_PERMISSION_DENIED',
      },
    });
    expect(
      controller.dependencies.scannerSessionStore.getState()
    ).toMatchObject({
      permissionStatus: 'denied',
      scanningStatus: 'error',
      errorCode: 'permission-denied',
    });
  });

  it('maps photo decode no-result into decode-failed session state without touching the buffer', async () => {
    const controller = createScannerRuntimeController({
      bufferStore: createBufferStore({
        storage: createBufferJSONStorage(createMemoryStateStorage()),
      }),
      bufferControlController: createBufferControlDependencies(),
      scannerSessionStore: createScannerSessionStore(),
      overlayArbitrationStore: createOverlayArbitrationStore(),
      liveScannerAdapter: createLiveScannerAdapterStub(),
      photoScannerAdapter: createPhotoScannerAdapterStub({
        decodeFile: async () => createScannerNoResult(),
      }),
    });

    controller.openSession({
      entrypoint: 'global',
      activeTab: 'photo',
    });

    const result = await controller.decodePhotoFile({
      file: new File(['hello'], 'code.png', {
        type: 'image/png',
      }),
    });

    expect(result).toMatchObject({
      code: 'photo-no-result',
      adapterResult: {
        code: 'NO_RESULT',
      },
    });
    expect(controller.dependencies.bufferStore.getState().items).toHaveLength(
      0
    );
    expect(
      controller.dependencies.scannerSessionStore.getState()
    ).toMatchObject({
      scanningStatus: 'error',
      errorCode: 'decode-failed',
    });
  });

  it('maps photo decode success into buffer submission through the injected adapter', async () => {
    const controller = createScannerRuntimeController({
      bufferStore: createBufferStore({
        storage: createBufferJSONStorage(createMemoryStateStorage()),
      }),
      bufferControlController: createBufferControlDependencies(),
      scannerSessionStore: createScannerSessionStore(),
      overlayArbitrationStore: createOverlayArbitrationStore(),
      liveScannerAdapter: createLiveScannerAdapterStub(),
      photoScannerAdapter: createPhotoScannerAdapterStub({
        decodeFile: async () =>
          createScannerDecodedResult({
            value: 'PHOTO-999',
            capturedAt: '2026-04-21T00:00:00.000Z',
            format: 'DATA_MATRIX',
            source: 'scanner-photo',
          }),
      }),
    });

    controller.openSession({
      entrypoint: 'global',
      activeTab: 'photo',
    });

    const result = await controller.decodePhotoFile({
      file: new File(['hello'], 'code.png', {
        type: 'image/png',
      }),
    });

    expect(result).toMatchObject({
      code: 'photo-decoded',
      submitResult: {
        code: 'submitted',
      },
    });
    expect(
      controller.dependencies.scannerSessionStore.getState()
    ).toMatchObject({
      selectedFile: expect.any(File),
      scanningStatus: 'success',
      errorCode: null,
    });
    expect(
      controller.dependencies.bufferStore.getState().items[0]
    ).toMatchObject({
      value: 'PHOTO-999',
      source: 'scanner-photo',
    });
  });
});
