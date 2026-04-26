import type { StoreApi } from 'zustand/vanilla';

import type {
  BufferApplyRequesterContext,
  BufferApplyRequesterKind,
} from './buffer-apply.types.ts';

export type BufferControlOwnerKind = 'buffer-page' | BufferApplyRequesterKind;

export interface BufferControlOwner {
  kind: BufferControlOwnerKind;
  context?: BufferApplyRequesterContext | null;
}

export type BufferControlMode = 'manage' | 'apply';

/** Control lease is exclusive interaction authority, not buffer data ownership. */
export interface BufferControlLease {
  leaseId: string;
  owner: BufferControlOwner;
  mode: BufferControlMode;
}

export interface AcquireBufferControlInput {
  owner: BufferControlOwner;
  mode: BufferControlMode;
}

export interface TransferBufferControlInput {
  fromOwner: BufferControlOwner;
  toOwner: BufferControlOwner;
  toMode: BufferControlMode;
}

export interface ReleaseBufferControlInput {
  owner: BufferControlOwner;
}

export interface CloseBufferControlSessionResult {
  code: 'reset';
  previousLeaseId: string | null;
}

export interface BufferControlSessionState {
  currentLease: BufferControlLease | null;
  acquireLease: (input: AcquireBufferControlInput) => BufferControlLease;
  releaseLease: () => CloseBufferControlSessionResult;
  reset: () => void;
}

export type BufferControlSessionStore = StoreApi<BufferControlSessionState>;

export type AcquireBufferControlResult =
  | {
      code: 'acquired';
      lease: BufferControlLease;
    }
  | {
      code: 'noop-already-held';
      lease: BufferControlLease;
    }
  | {
      code: 'lease-conflict';
      requestedOwner: BufferControlOwner;
      requestedMode: BufferControlMode;
      currentLease: BufferControlLease;
    };

export type ReleaseBufferControlResult =
  | {
      code: 'released';
      releasedLease: BufferControlLease;
    }
  | {
      code: 'not-held';
      owner: BufferControlOwner;
    }
  | {
      code: 'owner-mismatch';
      owner: BufferControlOwner;
      currentLease: BufferControlLease;
    };

export type TransferBufferControlResult =
  | {
      code: 'transferred';
      previousLease: BufferControlLease;
      lease: BufferControlLease;
    }
  | {
      code: 'not-held';
      fromOwner: BufferControlOwner;
    }
  | {
      code: 'owner-mismatch';
      fromOwner: BufferControlOwner;
      currentLease: BufferControlLease;
    }
  | {
      code: 'noop-already-held';
      previousLease: BufferControlLease;
      lease: BufferControlLease;
    };

export interface BufferControlController {
  acquireControl: (
    input: AcquireBufferControlInput
  ) => AcquireBufferControlResult;
  releaseControl: (
    input: ReleaseBufferControlInput
  ) => ReleaseBufferControlResult;
  /** Transfer is explicit so control mode changes stay machine-readable. */
  transferControl: (
    input: TransferBufferControlInput
  ) => TransferBufferControlResult;
  getCurrentLease: () => BufferControlLease | null;
}
