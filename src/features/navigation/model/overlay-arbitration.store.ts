import { createOverlayArbitrationStore } from './create-overlay-arbitration-store.ts';
import type { OverlayArbitrationStore } from './overlay-arbitration.types.ts';

export const overlayArbitrationStore: OverlayArbitrationStore =
  createOverlayArbitrationStore();
