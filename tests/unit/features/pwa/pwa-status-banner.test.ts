// @vitest-environment jsdom
import { createElement, type ReactNode } from 'react';
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

type ComponentProps = {
  children?: ReactNode;
};

type ButtonProps = ComponentProps & {
  onClick?: () => void;
};

const serviceWorkerState = vi.hoisted(() => ({
  needRefresh: false,
  offlineReady: false,
  setNeedRefresh: vi.fn(),
  setOfflineReady: vi.fn(),
  updateServiceWorker: vi.fn(),
}));

function passthroughElement(tagName: string) {
  return ({ children }: ComponentProps): ReactNode =>
    createElement(tagName, null, children);
}

vi.mock('@mantine/core', () => {
  const List = ({ children }: ComponentProps): ReactNode =>
    createElement('ul', null, children);
  List.Item = ({ children }: ComponentProps): ReactNode =>
    createElement('li', null, children);

  return {
    Affix: passthroughElement('div'),
    Button: ({ children, onClick }: ButtonProps): ReactNode =>
      createElement('button', { onClick, type: 'button' }, children),
    Group: passthroughElement('div'),
    List,
    Paper: passthroughElement('section'),
    Stack: passthroughElement('div'),
    Text: passthroughElement('p'),
  };
});

vi.mock('virtual:pwa-register/react', () => ({
  useRegisterSW: () => ({
    needRefresh: [
      serviceWorkerState.needRefresh,
      serviceWorkerState.setNeedRefresh,
    ],
    offlineReady: [
      serviceWorkerState.offlineReady,
      serviceWorkerState.setOfflineReady,
    ],
    updateServiceWorker: serviceWorkerState.updateServiceWorker,
  }),
}));

vi.mock('@/shared/config/app-version', () => ({
  appVersion: '0.1.0-beta.1',
}));

import { PwaStatusBanner } from '../../../../src/features/pwa/ui/pwa-status-banner/index.tsx';

describe('PwaStatusBanner', () => {
  beforeEach(() => {
    serviceWorkerState.needRefresh = false;
    serviceWorkerState.offlineReady = false;
    serviceWorkerState.setNeedRefresh.mockReset();
    serviceWorkerState.setOfflineReady.mockReset();
    serviceWorkerState.updateServiceWorker.mockReset();
    vi.stubGlobal('fetch', vi.fn());
  });

  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
  });

  it('shows fetched release notes when a new PWA version is available', async () => {
    serviceWorkerState.needRefresh = true;
    vi.mocked(fetch).mockResolvedValue({
      json: async () => ({
        changes: ['Первое изменение', 'Второе изменение'],
        title: 'Тестовый релиз',
        version: '0.1.0-beta.2',
      }),
      ok: true,
    } as Response);

    render(createElement(PwaStatusBanner));

    expect(screen.getByText('Доступна новая версия')).toBeTruthy();
    expect(screen.getByText('Обновить')).toBeTruthy();

    await waitFor(() => {
      expect(
        screen.getByText('Что изменилось в версии 0.1.0-beta.2')
      ).toBeTruthy();
    });

    expect(screen.getByText('Тестовый релиз')).toBeTruthy();
    expect(screen.getByText('Первое изменение')).toBeTruthy();
    expect(screen.getByText('Второе изменение')).toBeTruthy();
    expect(fetch).toHaveBeenCalledWith(
      expect.stringMatching(/release-notes\.json\?t=\d+$/),
      { cache: 'no-store' }
    );
  });

  it('keeps the update prompt usable when release notes cannot be fetched', async () => {
    serviceWorkerState.needRefresh = true;
    vi.mocked(fetch).mockRejectedValue(new Error('network failed'));

    render(createElement(PwaStatusBanner));

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledOnce();
    });

    expect(screen.getByText('Доступна новая версия')).toBeTruthy();
    expect(screen.getByText('Обновить')).toBeTruthy();
    expect(screen.queryByText(/Что изменилось/)).toBeNull();
  });

  it('does not fetch or render release notes for the offline-ready state', () => {
    serviceWorkerState.offlineReady = true;

    render(createElement(PwaStatusBanner));

    expect(screen.getByText('Приложение готово к офлайн-работе')).toBeTruthy();
    expect(screen.queryByText('Обновить')).toBeNull();
    expect(screen.queryByText(/Что изменилось/)).toBeNull();
    expect(fetch).not.toHaveBeenCalled();
  });
});
