import { describe, expect, it } from 'vitest';

import { createOverlayArbitrationStore } from '../../../../../src/features/navigation/model/create-overlay-arbitration-store.ts';

describe('createOverlayArbitrationStore', () => {
  it('starts empty with a fixed single-overlay policy', () => {
    const store = createOverlayArbitrationStore();

    expect(store.getState()).toMatchObject({
      policy: 'single-overlay',
      currentOverlay: null,
    });
  });

  it('opens an overlay when no other overlay is active', () => {
    const store = createOverlayArbitrationStore();

    const result = store.getState().openOverlay({
      id: 'scanner-session',
      kind: 'modal',
    });

    expect(result).toEqual({
      code: 'opened',
      overlay: {
        id: 'scanner-session',
        kind: 'modal',
      },
    });
    expect(store.getState().currentOverlay).toEqual({
      id: 'scanner-session',
      kind: 'modal',
    });
  });

  it('replaces the current overlay deterministically', () => {
    const store = createOverlayArbitrationStore();

    store.getState().openOverlay({
      id: 'scanner-session',
      kind: 'modal',
    });

    const result = store.getState().replaceOverlay({
      id: 'settings',
      kind: 'drawer',
    });

    expect(result).toEqual({
      code: 'replaced',
      previousOverlay: {
        id: 'scanner-session',
        kind: 'modal',
      },
      overlay: {
        id: 'settings',
        kind: 'drawer',
      },
    });
    expect(store.getState().currentOverlay).toEqual({
      id: 'settings',
      kind: 'drawer',
    });
  });

  it('closes the current overlay and reports what was closed', () => {
    const store = createOverlayArbitrationStore();

    store.getState().openOverlay({
      id: 'buffer-picker',
      kind: 'modal',
    });

    const result = store.getState().closeCurrentOverlay();

    expect(result).toEqual({
      code: 'closed',
      closedOverlay: {
        id: 'buffer-picker',
        kind: 'modal',
      },
    });
    expect(store.getState().currentOverlay).toBeNull();
  });

  it('reports a conflict when a different overlay requests open under no-stacking policy', () => {
    const store = createOverlayArbitrationStore();

    store.getState().openOverlay({
      id: 'scanner-session',
      kind: 'modal',
    });

    const result = store.getState().openOverlay({
      id: 'buffer-picker',
      kind: 'modal',
    });

    expect(result).toEqual({
      code: 'conflict',
      policy: 'single-overlay',
      currentOverlay: {
        id: 'scanner-session',
        kind: 'modal',
      },
      requestedOverlay: {
        id: 'buffer-picker',
        kind: 'modal',
      },
    });
    expect(store.getState().currentOverlay).toEqual({
      id: 'scanner-session',
      kind: 'modal',
    });
  });

  it('returns a no-op result when the same overlay is already active', () => {
    const store = createOverlayArbitrationStore();

    store.getState().openOverlay({
      id: 'settings',
      kind: 'drawer',
    });

    const result = store.getState().openOverlay({
      id: 'settings',
      kind: 'drawer',
    });

    expect(result).toEqual({
      code: 'noop-already-open',
      overlay: {
        id: 'settings',
        kind: 'drawer',
      },
    });
    expect(store.getState().currentOverlay).toEqual({
      id: 'settings',
      kind: 'drawer',
    });
  });

  it('resets to an empty overlay state deterministically', () => {
    const store = createOverlayArbitrationStore();

    store.getState().openOverlay({
      id: 'scanner-session',
      kind: 'modal',
    });

    store.getState().reset();

    expect(store.getState()).toMatchObject({
      policy: 'single-overlay',
      currentOverlay: null,
    });
  });
});
