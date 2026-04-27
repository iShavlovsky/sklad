import type { BufferControlOwner } from '@/features/buffer/core/buffer-core.public.ts';
import type { LiveScannerSessionHandle } from '@/infrastructure/browser/scanner/adapters/live.ts';
import type { ScannerSessionStopReason } from '@/infrastructure/browser/scanner/contracts/contracts.ts';
import { createScannerRecoverableFailure } from '@/infrastructure/browser/scanner/contracts/decode-result.ts';

import { SCANNER_OVERLAY } from './scanner-runtime.constants.ts';
import type { ScannerRuntimeControllerDependencies } from './scanner-runtime.dependencies.ts';
import { createDuplicateStatusMessage } from './scanner-runtime.duplicate-message.ts';
import {
  applyLiveCapabilityToSession,
  applyScannerFailureResult,
  isScannerOverlayActive,
} from './scanner-runtime.error-mapping.ts';
import type {
  ScannerRuntimeController,
  ScannerRuntimeDecodePhotoInput,
  ScannerRuntimeDecodeStatusInput,
  ScannerRuntimeFileSelectionInput,
  ScannerRuntimePermissionStatusInput,
  ScannerRuntimeStartLiveScanInput,
  ScannerRuntimeSubmitDecodedValueResult,
} from './scanner-runtime.types.ts';
import {
  clearScannerRuntimeError,
  createScannerControlOwner,
  getCurrentScannerControlOwner,
  isScannerSessionOpen,
  resolveDecodedValueSource,
  setScannerRuntimeError,
} from './scanner-runtime-session-state.ts';

/** Orchestrates scanner runtime over existing seams without introducing new data ownership. */
export function createScannerRuntimeController(
  dependencies: ScannerRuntimeControllerDependencies
): ScannerRuntimeController & {
  dependencies: ScannerRuntimeControllerDependencies;
} {
  let activeLiveSession: LiveScannerSessionHandle | null = null;
  let pendingLiveStopAfterStart: ScannerSessionStopReason | null = null;

  function resetLiveSessionState(): void {
    activeLiveSession = null;
  }

  function applyStoppedLiveSessionState(): void {
    if (!isScannerSessionOpen(dependencies)) {
      return;
    }

    const scannerSessionState = dependencies.scannerSessionStore.getState();
    scannerSessionState.setScanningStatus('idle');
    scannerSessionState.setStatus({
      message: null,
    });
    clearScannerRuntimeError(dependencies);
  }

  async function stopActiveLiveSession(
    reason: ScannerSessionStopReason,
    options?: {
      preserveSessionState?: boolean;
    }
  ) {
    if (activeLiveSession === null) {
      return {
        code: 'live-not-active',
      } as const;
    }

    const sessionToStop = activeLiveSession;
    resetLiveSessionState();

    const adapterResult = await sessionToStop.stop(reason);
    if (!adapterResult.ok) {
      if (adapterResult.code === 'SESSION_NOT_ACTIVE') {
        if (!options?.preserveSessionState) {
          applyStoppedLiveSessionState();
        }

        return {
          code: 'live-stopped',
          adapterResult: {
            ok: true,
            code: 'STOPPED',
            sessionId: sessionToStop.sessionId,
            reason,
          },
        } as const;
      }

      if (isScannerSessionOpen(dependencies)) {
        controller.reportDecodeStatus({
          status: 'failed',
          errorCode: 'session-error',
          message: adapterResult.message,
        });
      }

      return {
        code: 'live-stop-failed',
        adapterResult,
      } as const;
    }

    if (!options?.preserveSessionState) {
      applyStoppedLiveSessionState();
    }

    return {
      code: 'live-stopped',
      adapterResult,
    } as const;
  }

  const controller: ScannerRuntimeController & {
    dependencies: ScannerRuntimeControllerDependencies;
  } = {
    dependencies,
    openSession: (input) => {
      const controlOwner = createScannerControlOwner(input);
      const controlResult =
        controlOwner === null
          ? null
          : dependencies.bufferControlController.acquireControl({
              owner: controlOwner,
              mode: 'apply',
            });

      if (controlResult?.code === 'lease-conflict') {
        return {
          code: 'control-conflict',
          controlOwner: controlOwner as BufferControlOwner,
          controlResult,
        };
      }

      const overlayResult = dependencies.overlayArbitrationStore
        .getState()
        .openOverlay(SCANNER_OVERLAY);

      if (overlayResult.code === 'conflict') {
        if (controlOwner !== null && controlResult?.code === 'acquired') {
          dependencies.bufferControlController.releaseControl({
            owner: controlOwner,
          });
        }

        return {
          code: 'overlay-conflict',
          controlResult,
          overlayResult,
          overlay: SCANNER_OVERLAY,
        };
      }

      if (
        overlayResult.code === 'noop-already-open' &&
        isScannerSessionOpen(dependencies)
      ) {
        return {
          code: 'noop-already-open',
          controlResult,
          overlayResult,
          overlay: SCANNER_OVERLAY,
        };
      }

      dependencies.scannerSessionStore.getState().openSession(input);

      return {
        code: 'opened',
        controlResult,
        overlayResult,
        overlay: SCANNER_OVERLAY,
      };
    },
    closeSession: () => {
      const controlOwner = getCurrentScannerControlOwner(dependencies);
      const clearedScannerOverlay = isScannerOverlayActive(dependencies);

      if (clearedScannerOverlay) {
        dependencies.overlayArbitrationStore.getState().closeCurrentOverlay();
      }

      dependencies.scannerSessionStore.getState().closeSession();
      const controlReleaseResult =
        controlOwner === null
          ? null
          : dependencies.bufferControlController.releaseControl({
              owner: controlOwner,
            });

      return {
        code: 'closed',
        clearedScannerOverlay,
        controlReleaseResult,
      };
    },
    switchTab: (tab) => {
      const scannerSessionState = dependencies.scannerSessionStore.getState();

      if (!scannerSessionState.isOpen) {
        return {
          code: 'session-not-open',
          tab,
        };
      }

      if (scannerSessionState.activeTab === tab) {
        return {
          code: 'noop-already-active',
          tab,
        };
      }

      scannerSessionState.setActiveTab(tab);

      return {
        code: 'tab-switched',
        tab,
      };
    },
    loadLiveCapability: async () => {
      const capability = await dependencies.liveScannerAdapter.getCapability();

      if (isScannerSessionOpen(dependencies)) {
        applyLiveCapabilityToSession(controller, capability.permissionState);
      }

      return {
        code: 'live-capability-loaded',
        capability,
      };
    },
    loadPhotoCapability: async () => ({
      code: 'photo-capability-loaded',
      capability: await dependencies.photoScannerAdapter.getCapability(),
    }),
    startLiveScan: async (input: ScannerRuntimeStartLiveScanInput) => {
      const scannerSessionState = dependencies.scannerSessionStore.getState();

      if (!scannerSessionState.isOpen) {
        return {
          code: 'session-not-open',
        };
      }

      if (scannerSessionState.activeTab !== 'live') {
        return {
          code: 'wrong-tab',
          activeTab: scannerSessionState.activeTab,
        };
      }

      const capability = await dependencies.liveScannerAdapter.getCapability();
      applyLiveCapabilityToSession(controller, capability.permissionState);

      if (!capability.supported) {
        scannerSessionState.setScanningStatus('error');

        return {
          code: 'live-unsupported',
          capability,
        };
      }

      scannerSessionState.setScanningStatus('starting');
      scannerSessionState.setStatus({
        message: null,
      });
      clearScannerRuntimeError(dependencies);

      const adapterResult = await dependencies.liveScannerAdapter.startSession({
        ...input,
        onDecode: async (result) => {
          if (result.ok) {
            if (activeLiveSession === null) {
              pendingLiveStopAfterStart = 'caller';
            } else {
              const stopResult = await stopActiveLiveSession('caller', {
                preserveSessionState: true,
              });

              if (stopResult.code === 'live-stop-failed') {
                return;
              }
            }

            controller.submitDecodedValue({
              value: result.value.value,
              capturedAt: result.value.capturedAt,
              kind: result.value.format ?? undefined,
              source: result.value.source,
            });
            return;
          }

          applyScannerFailureResult(controller, result);
        },
      });

      if (!adapterResult.ok) {
        applyScannerFailureResult(controller, adapterResult);

        return {
          code: 'live-start-failed',
          capability,
          adapterResult,
        };
      }

      activeLiveSession = adapterResult.session;

      if (pendingLiveStopAfterStart !== null) {
        const deferredStopReason = pendingLiveStopAfterStart;
        pendingLiveStopAfterStart = null;

        const stopResult = await stopActiveLiveSession(deferredStopReason, {
          preserveSessionState: true,
        });

        if (stopResult.code === 'live-stop-failed') {
          return {
            code: 'live-start-failed',
            capability,
            adapterResult: createScannerRecoverableFailure(
              'SESSION_ABORTED',
              'Live scanner session stopped immediately after decode'
            ),
          };
        }
      }

      if (activeLiveSession === null) {
        return {
          code: 'live-started',
          capability,
          adapterResult,
        };
      }

      scannerSessionState.setScanningStatus('active');
      scannerSessionState.setStatus({
        message: null,
      });
      clearScannerRuntimeError(dependencies);

      return {
        code: 'live-started',
        capability,
        adapterResult,
      };
    },
    stopLiveScan: async (reason = 'caller') => {
      return stopActiveLiveSession(reason);
    },
    decodePhotoFile: async (input: ScannerRuntimeDecodePhotoInput) => {
      const scannerSessionState = dependencies.scannerSessionStore.getState();

      if (!scannerSessionState.isOpen) {
        return {
          code: 'session-not-open',
        };
      }

      if (scannerSessionState.activeTab !== 'photo') {
        return {
          code: 'wrong-tab',
          activeTab: scannerSessionState.activeTab,
        };
      }

      controller.reportFileSelection({
        status: 'selected',
        file: input.file,
      });
      controller.reportDecodeStatus({
        status: 'started',
      });

      const adapterResult =
        await dependencies.photoScannerAdapter.decodeFile(input);

      if (!adapterResult.ok) {
        applyScannerFailureResult(controller, adapterResult);

        if (adapterResult.kind === 'no-result') {
          return {
            code: 'photo-no-result',
            adapterResult,
          };
        }

        return {
          code: 'photo-decode-failed',
          adapterResult,
        };
      }

      const submitResult = controller.submitDecodedValue({
        value: adapterResult.value.value,
        capturedAt: adapterResult.value.capturedAt,
        kind: adapterResult.value.format ?? undefined,
        source: adapterResult.value.source,
      });

      if (submitResult.code === 'session-not-open') {
        return {
          code: 'photo-decode-failed',
          adapterResult: createScannerRecoverableFailure(
            'SESSION_ABORTED',
            'Scanner session closed before the decoded photo result could be submitted'
          ),
        };
      }

      if (
        submitResult.code === 'submitted' ||
        submitResult.code === 'submitted-with-eviction'
      ) {
        controller.reportDecodeStatus({
          status: 'succeeded',
        });
      }

      return {
        code: 'photo-decoded',
        adapterResult,
        submitResult,
      };
    },
    submitDecodedValue: (input): ScannerRuntimeSubmitDecodedValueResult => {
      const scannerSessionState = dependencies.scannerSessionStore.getState();

      if (!scannerSessionState.isOpen) {
        return {
          code: 'session-not-open',
        };
      }

      const bufferResult = dependencies.bufferStore.getState().addItem({
        value: input.value,
        capturedAt: input.capturedAt,
        kind: input.kind,
        source: resolveDecodedValueSource(dependencies, input),
      });

      if (bufferResult.code === 'added') {
        scannerSessionState.setScanningStatus('success');
        clearScannerRuntimeError(dependencies);

        return {
          code: 'submitted',
          bufferResult,
        };
      }

      if (bufferResult.code === 'added-with-eviction') {
        scannerSessionState.setScanningStatus('success');
        clearScannerRuntimeError(dependencies);

        return {
          code: 'submitted-with-eviction',
          bufferResult,
        };
      }

      if (bufferResult.code === 'duplicate') {
        scannerSessionState.setScanningStatus('warning');
        scannerSessionState.setStatus({
          message: createDuplicateStatusMessage(
            input.value,
            bufferResult.existingItem
          ),
        });
        clearScannerRuntimeError(dependencies);

        return {
          code: 'duplicate',
          bufferResult,
        };
      }

      scannerSessionState.setScanningStatus('error');

      return {
        code: 'empty-value',
        bufferResult,
      };
    },
    reportPermissionStatus: (input: ScannerRuntimePermissionStatusInput) => {
      const scannerSessionState = dependencies.scannerSessionStore.getState();

      if (!scannerSessionState.isOpen) {
        return {
          code: 'session-not-open',
          status: input.status,
        };
      }

      scannerSessionState.setPermissionStatus(input.status);

      if (input.status === 'denied') {
        setScannerRuntimeError(dependencies, {
          code: 'permission-denied',
          message: input.message ?? null,
        });
      } else if (input.status === 'unavailable') {
        setScannerRuntimeError(dependencies, {
          code: 'camera-unavailable',
          message: input.message ?? null,
        });
      } else {
        clearScannerRuntimeError(dependencies);
      }

      return {
        code: 'permission-status-reported',
        status: input.status,
      };
    },
    reportDecodeStatus: (input: ScannerRuntimeDecodeStatusInput) => {
      const scannerSessionState = dependencies.scannerSessionStore.getState();

      if (!scannerSessionState.isOpen) {
        return {
          code: 'session-not-open',
          status: input.status,
        };
      }

      if (input.status === 'started') {
        scannerSessionState.setScanningStatus('decoding');
        scannerSessionState.setStatus({
          message: input.message ?? null,
        });
        clearScannerRuntimeError(dependencies);
      } else if (input.status === 'failed') {
        setScannerRuntimeError(dependencies, {
          code: input.errorCode ?? 'decode-failed',
          message: input.message,
        });
      } else {
        scannerSessionState.setScanningStatus('success');
        scannerSessionState.setStatus({
          message: input.message ?? null,
        });
        clearScannerRuntimeError(dependencies);
      }

      return {
        code: 'decode-status-reported',
        status: input.status,
      };
    },
    reportFileSelection: (input: ScannerRuntimeFileSelectionInput) => {
      const scannerSessionState = dependencies.scannerSessionStore.getState();

      if (!scannerSessionState.isOpen) {
        return {
          code: 'session-not-open',
          status: input.status,
        };
      }

      if (input.status === 'selected') {
        scannerSessionState.setSelectedFile(input.file);
        scannerSessionState.setStatus({
          message: input.message ?? null,
        });
        clearScannerRuntimeError(dependencies);
      } else if (input.status === 'rejected-too-large') {
        scannerSessionState.clearSelectedFile();
        setScannerRuntimeError(dependencies, {
          code: 'file-too-large',
          message: input.message,
        });
      } else {
        scannerSessionState.clearSelectedFile();
        scannerSessionState.setStatus({
          message: input.message ?? null,
        });
      }

      return {
        code: 'file-selection-status-reported',
        status: input.status,
      };
    },
  };

  return controller;
}
