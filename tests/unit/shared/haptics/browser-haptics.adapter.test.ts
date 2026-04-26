import { afterEach, describe, expect, it, vi } from 'vitest';

import { BrowserHapticsAdapter } from '@/shared/haptics/browser-haptics.adapter';

describe('BrowserHapticsAdapter', () => {
  afterEach(() => {
    Reflect.deleteProperty(navigator, 'vibrate');
    vi.restoreAllMocks();
  });

  it('returns unsupported when vibrate is unavailable', async () => {
    const adapter = new BrowserHapticsAdapter();

    await expect(adapter.trigger('success')).resolves.toEqual({
      code: 'unsupported',
    });
  });

  it('returns suppressed when vibrate returns false', async () => {
    Object.defineProperty(navigator, 'vibrate', {
      configurable: true,
      value: vi.fn().mockReturnValue(false),
    });

    const adapter = new BrowserHapticsAdapter();

    await expect(adapter.trigger('warning')).resolves.toEqual({
      code: 'suppressed',
    });
  });

  it('returns triggered when vibrate succeeds', async () => {
    Object.defineProperty(navigator, 'vibrate', {
      configurable: true,
      value: vi.fn().mockReturnValue(true),
    });

    const adapter = new BrowserHapticsAdapter();

    await expect(adapter.trigger('error')).resolves.toEqual({
      code: 'triggered',
    });
  });
});
