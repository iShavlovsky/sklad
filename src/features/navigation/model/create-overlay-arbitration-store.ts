import { createStore } from 'zustand/vanilla';

import type {
  CloseCurrentOverlayResult,
  OpenOverlayResult,
  OverlayArbitrationState,
  OverlayArbitrationStore,
  OverlayDescriptor,
  ReplaceOverlayResult,
} from './overlay-arbitration.types.ts';

function createInitialOverlayArbitrationState() {
  return {
    policy: 'single-overlay',
    currentOverlay: null,
  } as const;
}

function isSameOverlay(
  left: OverlayDescriptor | null,
  right: OverlayDescriptor
): left is OverlayDescriptor {
  return left !== null && left.id === right.id && left.kind === right.kind;
}

/** Keeps global overlay identity exclusive without taking ownership of feature payload state. */
export function createOverlayArbitrationStore(): OverlayArbitrationStore {
  return createStore<OverlayArbitrationState>()((set, get) => ({
    ...createInitialOverlayArbitrationState(),
    openOverlay: (overlay): OpenOverlayResult => {
      const { currentOverlay, policy } = get();

      if (currentOverlay === null) {
        set({
          currentOverlay: overlay,
        });

        return {
          code: 'opened',
          overlay,
        };
      }

      if (isSameOverlay(currentOverlay, overlay)) {
        return {
          code: 'noop-already-open',
          overlay,
        };
      }

      return {
        code: 'conflict',
        policy,
        currentOverlay,
        requestedOverlay: overlay,
      };
    },
    replaceOverlay: (overlay): ReplaceOverlayResult => {
      const { currentOverlay } = get();

      if (currentOverlay === null) {
        set({
          currentOverlay: overlay,
        });

        return {
          code: 'opened',
          overlay,
        };
      }

      if (isSameOverlay(currentOverlay, overlay)) {
        return {
          code: 'noop-already-open',
          overlay,
        };
      }

      set({
        currentOverlay: overlay,
      });

      return {
        code: 'replaced',
        previousOverlay: currentOverlay,
        overlay,
      };
    },
    closeCurrentOverlay: (): CloseCurrentOverlayResult => {
      const { currentOverlay } = get();

      if (currentOverlay === null) {
        return {
          code: 'noop-already-closed',
        };
      }

      set({
        currentOverlay: null,
      });

      return {
        code: 'closed',
        closedOverlay: currentOverlay,
      };
    },
    reset: (): void => {
      set(createInitialOverlayArbitrationState());
    },
  }));
}
