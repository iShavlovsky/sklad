import { createStore } from 'zustand/vanilla';

import { createId } from '../../../shared/utils/create-id.ts';

import type {
  BufferApplyRequest,
  BufferApplySessionState,
  BufferApplySessionStore,
  CloseBufferApplySessionResult,
  OpenBufferApplyRequestInput,
} from './buffer-apply.types.ts';

function createInitialBufferApplySessionState() {
  return {
    isOpen: false,
    currentRequest: null,
    lastResult: null,
  } as const;
}

function createBufferApplyRequest(
  input: OpenBufferApplyRequestInput
): BufferApplyRequest {
  return {
    requestId: createId(),
    requester: {
      kind: input.requester.kind,
      ...(input.requester.context
        ? { context: input.requester.context }
        : { context: null }),
    },
    selectionMode: input.selectionMode ?? 'multiple',
    targetField: input.targetField,
    transferMode: 'copy',
  };
}

function createClosedSessionResult(
  currentRequest: BufferApplyRequest | null
): CloseBufferApplySessionResult {
  return {
    code: 'closed',
    previousRequestId: currentRequest?.requestId ?? null,
  };
}

/** Keeps non-UI picker request/result payloads out of overlay arbitration. */
export function createBufferApplySessionStore(): BufferApplySessionStore {
  return createStore<BufferApplySessionState>()((set, get) => ({
    ...createInitialBufferApplySessionState(),
    openSession: (input) => {
      const request = createBufferApplyRequest(input);
      set({
        isOpen: true,
        currentRequest: request,
        lastResult: null,
      });

      return request;
    },
    closeSession: () => {
      const closeResult = createClosedSessionResult(get().currentRequest);
      set({
        ...createInitialBufferApplySessionState(),
        lastResult: get().lastResult,
      });

      return closeResult;
    },
    setLastResult: (lastResult) => {
      set({
        lastResult,
      });
    },
    clearLastResult: () => {
      set({
        lastResult: null,
      });
    },
    reset: () => {
      set(createInitialBufferApplySessionState());
    },
  }));
}

export const bufferApplySessionStore: BufferApplySessionStore =
  createBufferApplySessionStore();
