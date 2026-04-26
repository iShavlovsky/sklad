import { createBufferControlController } from './buffer-control.controller.ts';
import { bufferControlSessionStore } from './buffer-control.session-store.ts';

export const bufferControlController = createBufferControlController({
  bufferControlSessionStore,
});

export type BufferControlControllerInstance = typeof bufferControlController;
