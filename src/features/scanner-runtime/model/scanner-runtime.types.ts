import type {
  AcquireBufferControlResult,
  BufferControlOwner,
  ReleaseBufferControlResult,
} from '@/features/buffer-core/model/buffer-control.types.ts';
import type { BufferAddResult } from '@/features/buffer-core/model/buffer-store.types.ts';
import type {
  OpenOverlayResult,
  OverlayDescriptor,
} from '@/features/navigation/model/overlay-arbitration.types.ts';

import type {
  LiveScannerSessionStopped,
  StartLiveScannerSessionInput,
  StartLiveScannerSessionResult,
  StopLiveScannerSessionResult,
} from '../../../infrastructure/browser/scanner/adapters/live.ts';
import type { DecodeScannerPhotoInput } from '../../../infrastructure/browser/scanner/adapters/photo.ts';
import type {
  ScannerLiveCapabilityReport,
  ScannerPhotoCapabilityReport,
} from '../../../infrastructure/browser/scanner/contracts/capability-report.ts';
import type { ScannerSessionStopReason } from '../../../infrastructure/browser/scanner/contracts/contracts.ts';
import type {
  ScannerDecodedResult,
  ScannerDecodeResult,
  ScannerNoResult,
} from '../../../infrastructure/browser/scanner/contracts/decode-result.ts';

import type {
  OpenScannerSessionInput,
  ScannerPermissionStatus,
  ScannerScanningStatus,
  ScannerSessionErrorCode,
  ScannerSessionTab,
} from './scanner-session.types.ts';

export interface ScannerRuntimeDecodedValueInput {
  value: string;
  capturedAt?: string;
  kind?: string;
  source?: 'scanner-live' | 'scanner-photo';
}

export interface ScannerRuntimePermissionStatusInput {
  status: ScannerPermissionStatus;
  message?: string | null;
}

export type ScannerRuntimeDecodeStatusInput =
  | {
      status: 'started';
      message?: string | null;
    }
  | {
      status: 'failed';
      errorCode?: Extract<
        ScannerSessionErrorCode,
        'decode-failed' | 'session-error'
      >;
      message: string;
    }
  | {
      status: 'succeeded';
      message?: string | null;
    };

export type ScannerRuntimeFileSelectionInput =
  | {
      status: 'selected';
      file: File;
      message?: string | null;
    }
  | {
      status: 'cleared';
      message?: string | null;
    }
  | {
      status: 'cancelled';
      message?: string | null;
    }
  | {
      status: 'rejected-too-large';
      message: string;
    };

export type ScannerRuntimeStartLiveScanInput = Omit<
  StartLiveScannerSessionInput,
  'onDecode'
>;

export type ScannerRuntimeDecodePhotoInput = DecodeScannerPhotoInput;

/** Coordinates scanner session, overlay identity, buffer submission, and browser adapters. */
export interface ScannerRuntimeController {
  openSession: (
    input: OpenScannerSessionInput
  ) => ScannerRuntimeOpenSessionResult;
  closeSession: () => ScannerRuntimeCloseSessionResult;
  switchTab: (tab: ScannerSessionTab) => ScannerRuntimeSwitchTabResult;
  loadLiveCapability: () => Promise<ScannerRuntimeLiveCapabilityResult>;
  loadPhotoCapability: () => Promise<ScannerRuntimePhotoCapabilityResult>;
  startLiveScan: (
    input: ScannerRuntimeStartLiveScanInput
  ) => Promise<ScannerRuntimeStartLiveScanResult>;
  stopLiveScan: (
    reason?: ScannerSessionStopReason
  ) => Promise<ScannerRuntimeStopLiveScanResult>;
  decodePhotoFile: (
    input: ScannerRuntimeDecodePhotoInput
  ) => Promise<ScannerRuntimeDecodePhotoFileResult>;
  submitDecodedValue: (
    input: ScannerRuntimeDecodedValueInput
  ) => ScannerRuntimeSubmitDecodedValueResult;
  reportPermissionStatus: (
    input: ScannerRuntimePermissionStatusInput
  ) => ScannerRuntimePermissionStatusResult;
  reportDecodeStatus: (
    input: ScannerRuntimeDecodeStatusInput
  ) => ScannerRuntimeDecodeStatusResult;
  reportFileSelection: (
    input: ScannerRuntimeFileSelectionInput
  ) => ScannerRuntimeFileSelectionResult;
}

export type ScannerRuntimeOpenSessionResult =
  | {
      code: 'opened';
      controlResult: Exclude<
        AcquireBufferControlResult,
        { code: 'lease-conflict' }
      > | null;
      overlayResult: OpenOverlayResult;
      overlay: OverlayDescriptor;
    }
  | {
      code: 'noop-already-open';
      controlResult: Exclude<
        AcquireBufferControlResult,
        { code: 'lease-conflict' }
      > | null;
      overlayResult: OpenOverlayResult;
      overlay: OverlayDescriptor;
    }
  | {
      code: 'control-conflict';
      controlOwner: BufferControlOwner;
      controlResult: Extract<
        AcquireBufferControlResult,
        { code: 'lease-conflict' }
      >;
    }
  | {
      code: 'overlay-conflict';
      controlResult: Exclude<
        AcquireBufferControlResult,
        { code: 'lease-conflict' }
      > | null;
      overlayResult: Extract<OpenOverlayResult, { code: 'conflict' }>;
      overlay: OverlayDescriptor;
    };

export interface ScannerRuntimeCloseSessionResult {
  code: 'closed';
  clearedScannerOverlay: boolean;
  controlReleaseResult: ReleaseBufferControlResult | null;
}

export type ScannerRuntimeSwitchTabResult =
  | {
      code: 'tab-switched';
      tab: ScannerSessionTab;
    }
  | {
      code: 'noop-already-active';
      tab: ScannerSessionTab;
    }
  | {
      code: 'session-not-open';
      tab: ScannerSessionTab;
    };

export interface ScannerRuntimeLiveCapabilityResult {
  code: 'live-capability-loaded';
  capability: ScannerLiveCapabilityReport;
}

export interface ScannerRuntimePhotoCapabilityResult {
  code: 'photo-capability-loaded';
  capability: ScannerPhotoCapabilityReport;
}

export type ScannerRuntimeStartLiveScanResult =
  | {
      code: 'live-started';
      capability: ScannerLiveCapabilityReport;
      adapterResult: Extract<StartLiveScannerSessionResult, { ok: true }>;
    }
  | {
      code: 'session-not-open';
    }
  | {
      code: 'wrong-tab';
      activeTab: ScannerSessionTab;
    }
  | {
      code: 'live-unsupported';
      capability: ScannerLiveCapabilityReport;
    }
  | {
      code: 'live-start-failed';
      capability: ScannerLiveCapabilityReport;
      adapterResult: Exclude<StartLiveScannerSessionResult, { ok: true }>;
    };

export type ScannerRuntimeStopLiveScanResult =
  | {
      code: 'live-stopped';
      adapterResult: LiveScannerSessionStopped;
    }
  | {
      code: 'live-not-active';
    }
  | {
      code: 'live-stop-failed';
      adapterResult: Exclude<
        StopLiveScannerSessionResult,
        LiveScannerSessionStopped
      >;
    };

export type ScannerRuntimeDecodePhotoFileResult =
  | {
      code: 'photo-decoded';
      adapterResult: ScannerDecodedResult;
      submitResult: Exclude<
        ScannerRuntimeSubmitDecodedValueResult,
        { code: 'session-not-open' }
      >;
    }
  | {
      code: 'photo-no-result';
      adapterResult: ScannerNoResult;
    }
  | {
      code: 'session-not-open';
    }
  | {
      code: 'wrong-tab';
      activeTab: ScannerSessionTab;
    }
  | {
      code: 'photo-decode-failed';
      adapterResult: Exclude<
        ScannerDecodeResult,
        ScannerDecodedResult | ScannerNoResult
      >;
    };

export type ScannerRuntimeSubmitDecodedValueResult =
  | {
      code: 'submitted';
      bufferResult: Extract<BufferAddResult, { code: 'added' }>;
    }
  | {
      code: 'submitted-with-eviction';
      bufferResult: Extract<BufferAddResult, { code: 'added-with-eviction' }>;
    }
  | {
      code: 'duplicate';
      bufferResult: Extract<BufferAddResult, { code: 'duplicate' }>;
    }
  | {
      code: 'empty-value';
      bufferResult: Extract<BufferAddResult, { code: 'empty-value' }>;
    }
  | {
      code: 'session-not-open';
    };

export type ScannerRuntimePermissionStatusResult =
  | {
      code: 'permission-status-reported';
      status: ScannerPermissionStatus;
    }
  | {
      code: 'session-not-open';
      status: ScannerPermissionStatus;
    };

export type ScannerRuntimeDecodeStatusResult =
  | {
      code: 'decode-status-reported';
      status: ScannerRuntimeDecodeStatusInput['status'];
    }
  | {
      code: 'session-not-open';
      status: ScannerRuntimeDecodeStatusInput['status'];
    };

export type ScannerRuntimeFileSelectionResult =
  | {
      code: 'file-selection-status-reported';
      status: ScannerRuntimeFileSelectionInput['status'];
    }
  | {
      code: 'session-not-open';
      status: ScannerRuntimeFileSelectionInput['status'];
    };

export interface ScannerRuntimeStatusSnapshot {
  permissionStatus: ScannerPermissionStatus;
  scanningStatus: ScannerScanningStatus;
  errorCode: ScannerSessionErrorCode | null;
  errorMessage: string | null;
  statusMessage: string | null;
}
