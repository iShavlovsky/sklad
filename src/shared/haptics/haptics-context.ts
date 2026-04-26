import { createContext, useContext } from 'react';

import type { HapticsPort } from './haptics.types';
import { NoopHapticsAdapter } from './noop-haptics.adapter';

export const hapticsContext = createContext<HapticsPort>(
  new NoopHapticsAdapter()
);

export function useHaptics(): HapticsPort {
  return useContext(hapticsContext);
}
