import type { BufferControlOwner } from '@/features/buffer/core/buffer-core.public.ts';

import type { ScannerRuntimeControllerDependencies } from './scanner-runtime.dependencies.ts';
import type { ScannerRuntimeDecodedValueInput } from './scanner-runtime.types.ts';
import type { OpenScannerSessionInput } from './scanner-session.types.ts';

export function isScannerSessionOpen(
  dependencies: ScannerRuntimeControllerDependencies
): boolean {
  return dependencies.scannerSessionStore.getState().isOpen;
}

export function createScannerControlOwner(
  input: OpenScannerSessionInput
): BufferControlOwner | null {
  if (input.entrypoint === 'global') {
    return null;
  }

  return {
    kind: input.entrypoint,
    ...(input.context ? { context: input.context } : { context: null }),
  };
}

export function getCurrentScannerControlOwner(
  dependencies: ScannerRuntimeControllerDependencies
): BufferControlOwner | null {
  const scannerSessionState = dependencies.scannerSessionStore.getState();
  if (!scannerSessionState.isOpen || scannerSessionState.entrypoint === null) {
    return null;
  }

  if (scannerSessionState.entrypoint === 'global') {
    return null;
  }

  return {
    kind: scannerSessionState.entrypoint,
    ...(scannerSessionState.context
      ? { context: scannerSessionState.context }
      : { context: null }),
  };
}

export function resolveDecodedValueSource(
  dependencies: ScannerRuntimeControllerDependencies,
  input: ScannerRuntimeDecodedValueInput
): NonNullable<ScannerRuntimeDecodedValueInput['source']> {
  if (input.source !== undefined) {
    return input.source;
  }

  return dependencies.scannerSessionStore.getState().activeTab === 'photo'
    ? 'scanner-photo'
    : 'scanner-live';
}

export function setScannerRuntimeError(
  dependencies: ScannerRuntimeControllerDependencies,
  input: {
    code:
      | 'permission-denied'
      | 'camera-unavailable'
      | 'decode-failed'
      | 'file-too-large'
      | 'session-error';
    message: string | null;
  }
): void {
  const scannerSessionState = dependencies.scannerSessionStore.getState();

  scannerSessionState.setScanningStatus('error');
  scannerSessionState.setError(input);
}

export function clearScannerRuntimeError(
  dependencies: ScannerRuntimeControllerDependencies
): void {
  const scannerSessionState = dependencies.scannerSessionStore.getState();

  scannerSessionState.clearError();
}
