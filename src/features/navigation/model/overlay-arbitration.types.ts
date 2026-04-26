import type { StoreApi } from 'zustand/vanilla';

export type OverlayArbitrationPolicy = 'single-overlay';

export type OverlayId = 'scanner-session' | 'buffer-picker' | 'settings';

export type OverlayKind = 'modal' | 'drawer';

export interface OverlayDescriptor {
  id: OverlayId;
  kind: OverlayKind;
}

export type OpenOverlayResult =
  | {
      code: 'opened';
      overlay: OverlayDescriptor;
    }
  | {
      code: 'noop-already-open';
      overlay: OverlayDescriptor;
    }
  | {
      code: 'conflict';
      policy: OverlayArbitrationPolicy;
      currentOverlay: OverlayDescriptor;
      requestedOverlay: OverlayDescriptor;
    };

export type ReplaceOverlayResult =
  | {
      code: 'opened';
      overlay: OverlayDescriptor;
    }
  | {
      code: 'noop-already-open';
      overlay: OverlayDescriptor;
    }
  | {
      code: 'replaced';
      previousOverlay: OverlayDescriptor;
      overlay: OverlayDescriptor;
    };

export type CloseCurrentOverlayResult =
  | {
      code: 'closed';
      closedOverlay: OverlayDescriptor;
    }
  | {
      code: 'noop-already-closed';
    };

export interface OverlayArbitrationState {
  policy: OverlayArbitrationPolicy;
  /** Overlay identity only. Request/result payloads belong to their owning feature seams. */
  currentOverlay: OverlayDescriptor | null;
  openOverlay: (overlay: OverlayDescriptor) => OpenOverlayResult;
  replaceOverlay: (overlay: OverlayDescriptor) => ReplaceOverlayResult;
  closeCurrentOverlay: () => CloseCurrentOverlayResult;
  reset: () => void;
}

export type OverlayArbitrationStore = StoreApi<OverlayArbitrationState>;
