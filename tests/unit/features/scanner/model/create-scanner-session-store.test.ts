import { describe, expect, it } from 'vitest';

import { createScannerSessionStore } from '../../../../../src/features/scanner-runtime/model/create-scanner-session-store.ts';

describe('createScannerSessionStore', () => {
  it('starts from a closed idle session with deterministic defaults', () => {
    const store = createScannerSessionStore();

    expect(store.getState()).toMatchObject({
      isOpen: false,
      entrypoint: null,
      context: null,
      activeTab: 'live',
      permissionStatus: 'idle',
      scanningStatus: 'idle',
      selectedFile: null,
      statusMessage: null,
      errorCode: null,
      errorMessage: null,
    });
  });

  it('opens a session with explicit entrypoint and context', () => {
    const store = createScannerSessionStore();

    store.getState().openSession({
      entrypoint: 'arrival-form',
      context: {
        recordId: 'arrival-draft-1',
        source: 'create',
      },
    });

    expect(store.getState()).toMatchObject({
      isOpen: true,
      entrypoint: 'arrival-form',
      context: {
        recordId: 'arrival-draft-1',
        source: 'create',
      },
      activeTab: 'live',
      permissionStatus: 'idle',
      scanningStatus: 'idle',
      selectedFile: null,
      errorCode: null,
      errorMessage: null,
    });
  });

  it('switches tabs without mutating the rest of the session contract', () => {
    const store = createScannerSessionStore();

    store.getState().openSession({
      entrypoint: 'global',
    });
    store.getState().setActiveTab('photo');

    expect(store.getState().activeTab).toBe('photo');
    expect(store.getState().isOpen).toBe(true);
    expect(store.getState().entrypoint).toBe('global');
  });

  it('tracks permission status changes explicitly', () => {
    const store = createScannerSessionStore();

    store.getState().openSession({
      entrypoint: 'global',
    });
    store.getState().setPermissionStatus('denied');

    expect(store.getState().permissionStatus).toBe('denied');
    expect(store.getState().errorCode).toBeNull();
  });

  it('tracks scanning status changes explicitly', () => {
    const store = createScannerSessionStore();

    store.getState().openSession({
      entrypoint: 'global',
    });
    store.getState().setScanningStatus('starting');
    store.getState().setScanningStatus('active');

    expect(store.getState().scanningStatus).toBe('active');
  });

  it('sets and clears the selected file without browser side effects', () => {
    const store = createScannerSessionStore();
    const selectedFile = new File(['scanner payload'], 'scan.png', {
      type: 'image/png',
    });

    store.getState().openSession({
      entrypoint: 'global',
    });
    store.getState().setSelectedFile(selectedFile);

    expect(store.getState().selectedFile).toBe(selectedFile);

    store.getState().clearSelectedFile();

    expect(store.getState().selectedFile).toBeNull();
  });

  it('resets runtime status and closes the session deterministically', () => {
    const store = createScannerSessionStore();
    const selectedFile = new File(['scanner payload'], 'scan.png', {
      type: 'image/png',
    });

    store.getState().openSession({
      entrypoint: 'departure-form',
      context: {
        recordId: 'departure-1',
      },
      activeTab: 'photo',
    });
    store.getState().setPermissionStatus('granted');
    store.getState().setScanningStatus('active');
    store.getState().setSelectedFile(selectedFile);
    store.getState().setStatus({
      message: 'Сканирование завершено.',
    });
    store.getState().setError({
      code: 'decode-failed',
      message: 'Не удалось распознать код.',
    });

    const closeResult = store.getState().closeSession();

    expect(closeResult).toMatchObject({
      code: 'closed',
      previousEntrypoint: 'departure-form',
      previousActiveTab: 'photo',
    });
    expect(store.getState()).toMatchObject({
      isOpen: false,
      entrypoint: null,
      context: null,
      activeTab: 'live',
      permissionStatus: 'idle',
      scanningStatus: 'idle',
      selectedFile: null,
      statusMessage: null,
      errorCode: null,
      errorMessage: null,
    });
  });
});
