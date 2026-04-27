import type { StoreApi } from 'zustand/vanilla';

export type ScannerSessionEntrypoint =
  | 'global'
  | 'arrival-form'
  | 'departure-form'
  | 'draft-form';

export interface ScannerSessionContext {
  recordId?: string;
  source?: 'create' | 'edit' | 'picker';
}

export type ScannerSessionTab = 'live' | 'photo';

export type ScannerPermissionStatus =
  | 'idle'
  | 'prompt'
  | 'granted'
  | 'denied'
  | 'unavailable';

export type ScannerScanningStatus =
  | 'idle'
  | 'starting'
  | 'active'
  | 'stopping'
  | 'decoding'
  | 'success'
  | 'warning'
  | 'error';

export type ScannerSessionErrorCode =
  | 'permission-denied'
  | 'camera-unavailable'
  | 'decode-failed'
  | 'file-too-large'
  | 'session-error';

export interface ScannerSessionStatusInput {
  message: string | null;
}

export interface ScannerSessionErrorInput {
  code: ScannerSessionErrorCode | null;
  message: string | null;
}

export interface OpenScannerSessionInput {
  entrypoint: ScannerSessionEntrypoint;
  context?: ScannerSessionContext | null;
  activeTab?: ScannerSessionTab;
}

/** Session store is runtime state only; decoded values still land in the shared buffer. */
export interface ScannerSessionState {
  isOpen: boolean;
  entrypoint: ScannerSessionEntrypoint | null;
  context: ScannerSessionContext | null;
  activeTab: ScannerSessionTab;
  permissionStatus: ScannerPermissionStatus;
  scanningStatus: ScannerScanningStatus;
  selectedFile: File | null;
  statusMessage: string | null;
  errorCode: ScannerSessionErrorCode | null;
  errorMessage: string | null;
  openSession: (input: OpenScannerSessionInput) => void;
  closeSession: () => CloseScannerSessionResult;
  resetSession: () => void;
  setActiveTab: (tab: ScannerSessionTab) => void;
  setPermissionStatus: (status: ScannerPermissionStatus) => void;
  setScanningStatus: (status: ScannerScanningStatus) => void;
  setSelectedFile: (file: File | null) => void;
  clearSelectedFile: () => void;
  setStatus: (input: ScannerSessionStatusInput) => void;
  setError: (input: ScannerSessionErrorInput) => void;
  clearError: () => void;
}

export interface CloseScannerSessionResult {
  code: 'closed';
  previousEntrypoint: ScannerSessionEntrypoint | null;
  previousActiveTab: ScannerSessionTab;
}

export type ScannerSessionStore = StoreApi<ScannerSessionState>;
