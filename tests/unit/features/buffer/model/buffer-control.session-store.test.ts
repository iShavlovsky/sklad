import { describe, expect, it } from 'vitest';

import { createBufferControlSessionStore } from '../../../../../src/features/buffer/core/model/buffer-control.session-store.ts';

describe('createBufferControlSessionStore', () => {
  it('stores one machine-readable lease at a time', () => {
    const store = createBufferControlSessionStore();

    const lease = store.getState().acquireLease({
      owner: {
        kind: 'buffer-page',
      },
      mode: 'manage',
    });

    expect(lease).toMatchObject({
      owner: {
        kind: 'buffer-page',
        context: null,
      },
      mode: 'manage',
    });
    expect(store.getState().currentLease).toMatchObject({
      leaseId: lease.leaseId,
      owner: {
        kind: 'buffer-page',
      },
      mode: 'manage',
    });
  });

  it('releases the current lease deterministically', () => {
    const store = createBufferControlSessionStore();
    const lease = store.getState().acquireLease({
      owner: {
        kind: 'arrival-form',
        context: {
          recordId: 'arrival-1',
          source: 'create',
        },
      },
      mode: 'apply',
    });

    const result = store.getState().releaseLease();

    expect(result).toEqual({
      code: 'reset',
      previousLeaseId: lease.leaseId,
    });
    expect(store.getState().currentLease).toBeNull();
  });
});
