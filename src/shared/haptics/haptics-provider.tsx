import { type PropsWithChildren, type ReactElement, useMemo } from 'react';

import { BrowserHapticsAdapter } from './browser-haptics.adapter';
import type { HapticsPort } from './haptics.types';
import { hapticsContext } from './haptics-context';
import { NoopHapticsAdapter } from './noop-haptics.adapter';

export function HapticsProvider({
  children,
}: Readonly<PropsWithChildren>): ReactElement {
  const value = useMemo<HapticsPort>(() => {
    if (typeof navigator === 'undefined' || !('vibrate' in navigator))
      return new NoopHapticsAdapter();
    return new BrowserHapticsAdapter();
  }, []);

  return (
    <hapticsContext.Provider value={value}>{children}</hapticsContext.Provider>
  );
}
