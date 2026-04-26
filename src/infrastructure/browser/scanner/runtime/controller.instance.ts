import { bufferControlController } from '../../../../features/buffer-core/model/buffer-control.controller.instance.ts';
import { bufferStore } from '../../../../features/buffer-core/model/buffer-store.ts';
import { overlayArbitrationStore } from '../../../../features/navigation/model/overlay-arbitration.store.ts';
import { scannerSessionStore } from '../../../../features/scanner-runtime/model/scanner-session.store.ts';

import { createBrowserScannerRuntimeController } from './controller.ts';

export const browserScannerRuntimeController =
  createBrowserScannerRuntimeController({
    bufferStore,
    bufferControlController,
    scannerSessionStore,
    overlayArbitrationStore,
  });

export type BrowserScannerRuntimeController =
  typeof browserScannerRuntimeController;
