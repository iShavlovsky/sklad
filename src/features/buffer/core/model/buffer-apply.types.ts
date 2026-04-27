import type { StoreApi } from 'zustand/vanilla';

import type { OverlayArbitrationStore } from '@/features/navigation/model/overlay-arbitration.types.ts';
import type {
  OpenOverlayResult,
  OverlayDescriptor,
} from '@/features/navigation/model/overlay-arbitration.types.ts';

import type { BufferApplyResult } from './buffer-apply.result.ts';
import type {
  AcquireBufferControlResult,
  BufferControlController,
  ReleaseBufferControlResult,
} from './buffer-control.types.ts';
import type { BufferStore } from './buffer-store.types.ts';

export type BufferApplyRequesterKind =
  | 'arrival-form'
  | 'departure-form'
  | 'draft-form';

export interface BufferApplyRequesterContext {
  recordId?: string;
  source?: 'create' | 'edit' | 'picker';
}

export interface BufferApplyRequester {
  kind: BufferApplyRequesterKind;
  context?: BufferApplyRequesterContext | null;
}

export type BufferApplySelectionMode = 'single' | 'multiple';

export type BufferApplyTargetField = 'codes';

export interface OpenBufferApplyRequestInput {
  requester: BufferApplyRequester;
  selectionMode?: BufferApplySelectionMode;
  targetField: BufferApplyTargetField;
}

export interface BufferApplyRequest {
  requestId: string;
  requester: BufferApplyRequester;
  selectionMode: BufferApplySelectionMode;
  targetField: BufferApplyTargetField;
  /** Applying buffer values always copies them into form-local state. */
  transferMode: 'copy';
}

export interface CloseBufferApplySessionResult {
  code: 'closed';
  previousRequestId: string | null;
}

export interface BufferApplySessionState {
  isOpen: boolean;
  currentRequest: BufferApplyRequest | null;
  lastResult: BufferApplyResult | null;
  openSession: (input: OpenBufferApplyRequestInput) => BufferApplyRequest;
  closeSession: () => CloseBufferApplySessionResult;
  setLastResult: (result: BufferApplyResult) => void;
  clearLastResult: () => void;
  reset: () => void;
}

export type BufferApplySessionStore = StoreApi<BufferApplySessionState>;

/** Narrow dependency bundle: overlay identity stays outside picker payload state. */
export interface BufferApplyControllerDependencies {
  bufferStore: Pick<BufferStore, 'getState'>;
  bufferApplySessionStore: Pick<BufferApplySessionStore, 'getState'>;
  bufferControlController: Pick<
    BufferControlController,
    'acquireControl' | 'releaseControl'
  >;
  overlayArbitrationStore: Pick<OverlayArbitrationStore, 'getState'>;
}

export type OpenBufferApplyRequestResult =
  | {
      code: 'opened';
      controlResult: Exclude<
        AcquireBufferControlResult,
        { code: 'lease-conflict' }
      >;
      overlayResult: OpenOverlayResult;
      request: BufferApplyRequest;
      overlay: OverlayDescriptor;
    }
  | {
      code: 'noop-already-open';
      controlResult: Exclude<
        AcquireBufferControlResult,
        { code: 'lease-conflict' }
      >;
      overlayResult: OpenOverlayResult;
      request: BufferApplyRequest;
      overlay: OverlayDescriptor;
    }
  | {
      code: 'control-conflict';
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
      >;
      overlayResult: Extract<OpenOverlayResult, { code: 'conflict' }>;
      overlay: OverlayDescriptor;
    };

export type CancelBufferApplyRequestResult =
  | {
      code: 'cancelled';
      controlReleaseResult: ReleaseBufferControlResult;
      result: Extract<BufferApplyResult, { code: 'cancelled' }>;
      clearedPickerOverlay: boolean;
    }
  | {
      code: 'session-not-open';
    };

export type ApplySelectedBufferItemsResult =
  | {
      code: 'applied';
      controlReleaseResult: ReleaseBufferControlResult;
      result: Extract<BufferApplyResult, { code: 'applied' }>;
      clearedPickerOverlay: boolean;
    }
  | {
      code: 'session-not-open';
    }
  | {
      code: 'picker-not-active';
    }
  | {
      code: 'selection-empty';
      request: BufferApplyRequest;
    }
  | {
      code: 'selection-mode-mismatch';
      request: BufferApplyRequest;
      selectedItemIds: string[];
    }
  | {
      code: 'items-missing';
      request: BufferApplyRequest;
      missingItemIds: string[];
    };

export interface BufferApplyController {
  openPicker: (
    input: OpenBufferApplyRequestInput
  ) => OpenBufferApplyRequestResult;
  cancelPicker: () => CancelBufferApplyRequestResult;
  /** Returns copied values only; it never mutates or deletes buffer items. */
  applySelectedItems: (input: {
    selectedItemIds: string[];
  }) => ApplySelectedBufferItemsResult;
  clearLastResult: () => void;
}
