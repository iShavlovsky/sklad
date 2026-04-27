import type {
  BufferControlController,
  BufferStore,
} from '@/features/buffer/core/buffer-core.public.ts';

import type { OverlayArbitrationStore } from '../../../../features/navigation/model/overlay-arbitration.types.ts';
import { createScannerRuntimeController } from '../../../../features/scanner/runtime/model/scanner-runtime-controller.ts';
import type { ScannerSessionStore } from '../../../../features/scanner/runtime/model/scanner-session.types.ts';
import { createLiveScannerAdapter } from '../adapters/live.ts';
import { createPhotoScannerAdapter } from '../adapters/photo.ts';

export interface CreateBrowserScannerRuntimeControllerInput {
  bufferStore: Pick<BufferStore, 'getState'>;
  bufferControlController: Pick<
    BufferControlController,
    'acquireControl' | 'releaseControl'
  >;
  scannerSessionStore: Pick<ScannerSessionStore, 'getState'>;
  overlayArbitrationStore: Pick<OverlayArbitrationStore, 'getState'>;
}

/** Browser-only composition root that binds the runtime controller to ZXing-backed adapters. */
export function createBrowserScannerRuntimeController(
  input: CreateBrowserScannerRuntimeControllerInput
) {
  return createScannerRuntimeController({
    ...input,
    liveScannerAdapter: createLiveScannerAdapter(),
    photoScannerAdapter: createPhotoScannerAdapter(),
  });
}
