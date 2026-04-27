import type {
  BufferControlController,
  BufferStore,
} from '@/features/buffer/core/buffer-core.public.ts';
import type { OverlayArbitrationStore } from '@/features/navigation/model/overlay-arbitration.types.ts';
import type { LiveScannerAdapter } from '@/infrastructure/browser/scanner/adapters/live.ts';
import type { PhotoScannerAdapter } from '@/infrastructure/browser/scanner/adapters/photo.ts';

import type { ScannerSessionStore } from './scanner-session.types.ts';

/** Narrow runtime-controller dependency bundle over existing seams only. */
export interface ScannerRuntimeControllerDependencies {
  bufferStore: Pick<BufferStore, 'getState'>;
  bufferControlController: Pick<
    BufferControlController,
    'acquireControl' | 'releaseControl'
  >;
  scannerSessionStore: Pick<ScannerSessionStore, 'getState'>;
  overlayArbitrationStore: Pick<OverlayArbitrationStore, 'getState'>;
  liveScannerAdapter: Pick<
    LiveScannerAdapter,
    'getCapability' | 'startSession'
  >;
  photoScannerAdapter: Pick<
    PhotoScannerAdapter,
    'decodeFile' | 'getCapability'
  >;
}
