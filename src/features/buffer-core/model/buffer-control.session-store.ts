import { createStore } from 'zustand/vanilla';

import { createId } from '../../../shared/utils/create-id.ts';

import type {
  AcquireBufferControlInput,
  BufferControlLease,
  BufferControlSessionState,
  BufferControlSessionStore,
  CloseBufferControlSessionResult,
} from './buffer-control.types.ts';

function createBufferControlLease(
  input: AcquireBufferControlInput
): BufferControlLease {
  return {
    leaseId: createId(),
    owner: {
      kind: input.owner.kind,
      ...(input.owner.context
        ? { context: input.owner.context }
        : { context: null }),
    },
    mode: input.mode,
  };
}

function createResetResult(
  currentLease: BufferControlLease | null
): CloseBufferControlSessionResult {
  return {
    code: 'reset',
    previousLeaseId: currentLease?.leaseId ?? null,
  };
}

/** Tracks which orchestration owner currently has exclusive buffer interaction control. */
export function createBufferControlSessionStore(): BufferControlSessionStore {
  return createStore<BufferControlSessionState>()((set, get) => ({
    currentLease: null,
    acquireLease: (input) => {
      const lease = createBufferControlLease(input);
      set({
        currentLease: lease,
      });

      return lease;
    },
    releaseLease: () => {
      const result = createResetResult(get().currentLease);
      set({
        currentLease: null,
      });

      return result;
    },
    reset: () => {
      set({
        currentLease: null,
      });
    },
  }));
}

export const bufferControlSessionStore: BufferControlSessionStore =
  createBufferControlSessionStore();
