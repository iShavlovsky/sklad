import { useEffect, useRef } from 'react';

import type { HapticPattern } from './haptics.types';
import { useHaptics } from './haptics-context';

type UseHapticSignalInput = {
  enabled?: boolean;
  pattern: HapticPattern;
  signal: string | null;
};

export function useHapticSignal({
  enabled = true,
  pattern,
  signal,
}: Readonly<UseHapticSignalInput>): void {
  const haptics = useHaptics();
  const previousSignalRef = useRef<string | null>(null);

  useEffect(() => {
    if (!enabled || signal === null) {
      if (signal === null) previousSignalRef.current = null;
      return;
    }

    if (previousSignalRef.current === signal) return;
    previousSignalRef.current = signal;
    void haptics.trigger(pattern);
  }, [enabled, haptics, pattern, signal]);
}
