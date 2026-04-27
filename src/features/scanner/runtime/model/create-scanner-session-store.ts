import { createStore } from 'zustand/vanilla';

import type {
  CloseScannerSessionResult,
  OpenScannerSessionInput,
  ScannerPermissionStatus,
  ScannerScanningStatus,
  ScannerSessionState,
  ScannerSessionStore,
  ScannerSessionTab,
} from './scanner-session.types.ts';

type ScannerSessionInitialState = Pick<
  ScannerSessionState,
  | 'isOpen'
  | 'entrypoint'
  | 'context'
  | 'activeTab'
  | 'permissionStatus'
  | 'scanningStatus'
  | 'selectedFile'
  | 'statusMessage'
  | 'errorCode'
  | 'errorMessage'
>;

function createInitialScannerSessionState(): ScannerSessionInitialState {
  return {
    isOpen: false,
    entrypoint: null,
    context: null,
    activeTab: 'live' satisfies ScannerSessionTab,
    permissionStatus: 'idle' satisfies ScannerPermissionStatus,
    scanningStatus: 'idle' satisfies ScannerScanningStatus,
    selectedFile: null,
    statusMessage: null,
    errorCode: null,
    errorMessage: null,
  };
}

function createClosedSessionResult(
  previousState: Pick<ScannerSessionState, 'entrypoint' | 'activeTab'>
): CloseScannerSessionResult {
  return {
    code: 'closed',
    previousEntrypoint: previousState.entrypoint,
    previousActiveTab: previousState.activeTab,
  };
}

function resolveSessionOpenState(input: OpenScannerSessionInput) {
  return {
    ...createInitialScannerSessionState(),
    isOpen: true,
    entrypoint: input.entrypoint,
    context: input.context ?? null,
    activeTab: input.activeTab ?? 'live',
  };
}

/** Owns scanner-session lifecycle state only; decode engines stay outside this store. */
export function createScannerSessionStore(): ScannerSessionStore {
  return createStore<ScannerSessionState>()((set, get) => ({
    ...createInitialScannerSessionState(),
    openSession: (input): void => {
      set(resolveSessionOpenState(input));
    },
    closeSession: (): CloseScannerSessionResult => {
      const closeResult = createClosedSessionResult(get());
      set(createInitialScannerSessionState());

      return closeResult;
    },
    resetSession: (): void => {
      set(createInitialScannerSessionState());
    },
    setActiveTab: (activeTab): void => {
      set({
        activeTab,
      });
    },
    setPermissionStatus: (permissionStatus): void => {
      set({
        permissionStatus,
      });
    },
    setScanningStatus: (scanningStatus): void => {
      set({
        scanningStatus,
      });
    },
    setSelectedFile: (selectedFile): void => {
      set({
        selectedFile,
      });
    },
    clearSelectedFile: (): void => {
      set({
        selectedFile: null,
      });
    },
    setStatus: ({ message }): void => {
      set({
        statusMessage: message,
      });
    },
    setError: ({ code, message }): void => {
      set({
        errorCode: code,
        errorMessage: message,
      });
    },
    clearError: (): void => {
      set({
        errorCode: null,
        errorMessage: null,
      });
    },
  }));
}
