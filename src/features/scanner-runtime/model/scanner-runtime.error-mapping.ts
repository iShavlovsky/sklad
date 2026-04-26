import { SCANNER_OVERLAY } from './scanner-runtime.constants.ts';
import type { ScannerRuntimeControllerDependencies } from './scanner-runtime.dependencies.ts';
import type { ScannerRuntimeController } from './scanner-runtime.types.ts';
import type { ScannerRuntimePermissionStatusInput } from './scanner-runtime.types.ts';

export function isScannerOverlayActive(
  dependencies: ScannerRuntimeControllerDependencies
): boolean {
  const { currentOverlay } = dependencies.overlayArbitrationStore.getState();

  return (
    currentOverlay?.id === SCANNER_OVERLAY.id &&
    currentOverlay.kind === SCANNER_OVERLAY.kind
  );
}

export function mapBrowserPermissionStateToSessionStatus(
  permissionState: 'granted' | 'prompt' | 'denied' | 'unavailable' | 'unknown'
): ScannerRuntimePermissionStatusInput['status'] {
  switch (permissionState) {
    case 'granted':
      return 'granted';
    case 'prompt':
      return 'prompt';
    case 'denied':
      return 'denied';
    case 'unavailable':
      return 'unavailable';
    default:
      return 'idle';
  }
}

export function applyLiveCapabilityToSession(
  controller: ScannerRuntimeController,
  permissionState: 'granted' | 'prompt' | 'denied' | 'unavailable' | 'unknown'
): void {
  controller.reportPermissionStatus({
    status: mapBrowserPermissionStateToSessionStatus(permissionState),
  });
}

export function applyScannerFailureResult(
  controller: ScannerRuntimeController,
  result: {
    code: string;
    message: string;
  }
): void {
  switch (result.code) {
    case 'CAMERA_PERMISSION_DENIED':
      controller.reportPermissionStatus({
        status: 'denied',
        message: result.message,
      });
      return;
    case 'CAMERA_NOT_FOUND':
    case 'CAMERA_UNAVAILABLE':
    case 'BROWSER_UNSUPPORTED':
    case 'SECURE_CONTEXT_REQUIRED':
      controller.reportPermissionStatus({
        status: 'unavailable',
        message: result.message,
      });
      return;
    case 'FILE_TOO_LARGE':
      controller.reportFileSelection({
        status: 'rejected-too-large',
        message: result.message,
      });
      return;
    case 'NO_RESULT':
    case 'DECODE_FAILED':
      controller.reportDecodeStatus({
        status: 'failed',
        errorCode: 'decode-failed',
        message: result.message,
      });
      return;
    default:
      controller.reportDecodeStatus({
        status: 'failed',
        errorCode: 'session-error',
        message: result.message,
      });
  }
}
