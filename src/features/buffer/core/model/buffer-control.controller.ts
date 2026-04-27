import {
  isSameBufferControlLease,
  isSameBufferControlOwner,
} from './buffer-control.result.ts';
import type {
  AcquireBufferControlInput,
  AcquireBufferControlResult,
  BufferControlController,
  BufferControlLease,
  BufferControlSessionStore,
  ReleaseBufferControlInput,
  ReleaseBufferControlResult,
  TransferBufferControlInput,
  TransferBufferControlResult,
} from './buffer-control.types.ts';

export interface BufferControlControllerDependencies {
  bufferControlSessionStore: Pick<BufferControlSessionStore, 'getState'>;
}

/** Keeps exclusive buffer interaction control separate from the singleton buffer data layer. */
export function createBufferControlController(
  dependencies: BufferControlControllerDependencies
): BufferControlController & {
  dependencies: BufferControlControllerDependencies;
} {
  const controller: BufferControlController & {
    dependencies: BufferControlControllerDependencies;
  } = {
    dependencies,
    acquireControl: (
      input: AcquireBufferControlInput
    ): AcquireBufferControlResult => {
      const { currentLease } =
        dependencies.bufferControlSessionStore.getState();
      if (currentLease === null) {
        return {
          code: 'acquired',
          lease: dependencies.bufferControlSessionStore
            .getState()
            .acquireLease(input),
        };
      }

      const requestedLease: BufferControlLease = {
        leaseId: currentLease.leaseId,
        owner: {
          kind: input.owner.kind,
          ...(input.owner.context
            ? { context: input.owner.context }
            : { context: null }),
        },
        mode: input.mode,
      };

      if (isSameBufferControlLease(currentLease, requestedLease)) {
        return {
          code: 'noop-already-held',
          lease: currentLease,
        };
      }

      return {
        code: 'lease-conflict',
        requestedOwner: requestedLease.owner,
        requestedMode: requestedLease.mode,
        currentLease,
      };
    },
    releaseControl: (
      input: ReleaseBufferControlInput
    ): ReleaseBufferControlResult => {
      const { currentLease } =
        dependencies.bufferControlSessionStore.getState();
      if (currentLease === null) {
        return {
          code: 'not-held',
          owner: input.owner,
        };
      }

      if (!isSameBufferControlOwner(currentLease.owner, input.owner)) {
        return {
          code: 'owner-mismatch',
          owner: input.owner,
          currentLease,
        };
      }

      dependencies.bufferControlSessionStore.getState().releaseLease();

      return {
        code: 'released',
        releasedLease: currentLease,
      };
    },
    transferControl: (
      input: TransferBufferControlInput
    ): TransferBufferControlResult => {
      const { currentLease } =
        dependencies.bufferControlSessionStore.getState();
      if (currentLease === null) {
        return {
          code: 'not-held',
          fromOwner: input.fromOwner,
        };
      }

      if (!isSameBufferControlOwner(currentLease.owner, input.fromOwner)) {
        return {
          code: 'owner-mismatch',
          fromOwner: input.fromOwner,
          currentLease,
        };
      }

      const nextLeaseShape: BufferControlLease = {
        leaseId: currentLease.leaseId,
        owner: {
          kind: input.toOwner.kind,
          ...(input.toOwner.context
            ? { context: input.toOwner.context }
            : { context: null }),
        },
        mode: input.toMode,
      };

      if (isSameBufferControlLease(currentLease, nextLeaseShape)) {
        return {
          code: 'noop-already-held',
          previousLease: currentLease,
          lease: currentLease,
        };
      }

      const lease = dependencies.bufferControlSessionStore
        .getState()
        .acquireLease({
          owner: input.toOwner,
          mode: input.toMode,
        });

      return {
        code: 'transferred',
        previousLease: currentLease,
        lease,
      };
    },
    getCurrentLease: () =>
      dependencies.bufferControlSessionStore.getState().currentLease,
  };

  return controller;
}
