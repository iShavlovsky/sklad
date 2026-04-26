import { describe, expect, it } from 'vitest';

import { createBufferApplySessionStore } from '../../../../../src/features/buffer-core/model/buffer-apply.session-store.ts';

describe('createBufferApplySessionStore', () => {
  it('opens a buffer-apply session with a machine-readable copy request', () => {
    const store = createBufferApplySessionStore();

    const request = store.getState().openSession({
      requester: {
        kind: 'arrival-form',
        context: {
          recordId: 'arrival-1',
          source: 'create',
        },
      },
      selectionMode: 'multiple',
      targetField: 'codes',
    });

    expect(request).toMatchObject({
      requester: {
        kind: 'arrival-form',
        context: {
          recordId: 'arrival-1',
          source: 'create',
        },
      },
      selectionMode: 'multiple',
      targetField: 'codes',
      transferMode: 'copy',
    });
    expect(store.getState()).toMatchObject({
      isOpen: true,
      currentRequest: expect.objectContaining({
        requestId: request.requestId,
        transferMode: 'copy',
      }),
      lastResult: null,
    });
  });

  it('closes the session without discarding the last resolved result', () => {
    const store = createBufferApplySessionStore();
    const request = store.getState().openSession({
      requester: {
        kind: 'departure-form',
      },
      targetField: 'codes',
    });
    store.getState().setLastResult({
      code: 'cancelled',
      requestId: request.requestId,
      transferMode: 'copy',
    });

    const result = store.getState().closeSession();

    expect(result).toEqual({
      code: 'closed',
      previousRequestId: request.requestId,
    });
    expect(store.getState()).toMatchObject({
      isOpen: false,
      currentRequest: null,
      lastResult: {
        code: 'cancelled',
        requestId: request.requestId,
        transferMode: 'copy',
      },
    });
  });

  it('clears the last result explicitly without mutating the request state', () => {
    const store = createBufferApplySessionStore();
    const request = store.getState().openSession({
      requester: {
        kind: 'draft-form',
      },
      targetField: 'codes',
    });
    store.getState().setLastResult({
      code: 'cancelled',
      requestId: request.requestId,
      transferMode: 'copy',
    });

    store.getState().clearLastResult();

    expect(store.getState()).toMatchObject({
      isOpen: true,
      currentRequest: expect.objectContaining({
        requestId: request.requestId,
      }),
      lastResult: null,
    });
  });
});
