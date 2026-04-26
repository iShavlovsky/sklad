import { overlayArbitrationStore } from '@/features/navigation/model/overlay-arbitration.store.ts';

import { createBufferApplyController } from './buffer-apply.controller.ts';
import { bufferApplySessionStore } from './buffer-apply.session-store.ts';
import { bufferControlController } from './buffer-control.controller.instance.ts';
import { bufferStore } from './buffer-store.ts';

export const bufferApplyController = createBufferApplyController({
  bufferStore,
  bufferApplySessionStore,
  bufferControlController,
  overlayArbitrationStore,
});

export type BufferApplyControllerInstance = typeof bufferApplyController;
