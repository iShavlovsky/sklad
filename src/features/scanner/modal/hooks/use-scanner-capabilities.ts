import { useCallback, useEffect, useState } from 'react';

import type { ScannerRuntimeControllerInstance } from '@/features/scanner/runtime/scanner-runtime.public.ts';

import type { ScannerCapabilityState } from '../types.ts';

export function useScannerCapabilities(
  controller: ScannerRuntimeControllerInstance,
  opened: boolean
): {
  capabilities: ScannerCapabilityState;
  reloadCapabilities: () => Promise<ScannerCapabilityState>;
} {
  const [capabilities, setCapabilities] = useState<ScannerCapabilityState>({
    live: null,
    photo: null,
  });

  const reloadCapabilities =
    useCallback(async (): Promise<ScannerCapabilityState> => {
      const [liveResult, photoResult] = await Promise.all([
        controller.loadLiveCapability(),
        controller.loadPhotoCapability(),
      ]);

      const nextCapabilities = {
        live: liveResult.capability,
        photo: photoResult.capability,
      };

      setCapabilities(nextCapabilities);

      return nextCapabilities;
    }, [controller]);

  useEffect(() => {
    if (!opened) {
      return;
    }

    let cancelled = false;

    const syncCapabilities = async (): Promise<void> => {
      const [liveResult, photoResult] = await Promise.all([
        controller.loadLiveCapability(),
        controller.loadPhotoCapability(),
      ]);

      if (cancelled) {
        return;
      }

      setCapabilities({
        live: liveResult.capability,
        photo: photoResult.capability,
      });
    };

    void syncCapabilities();

    return () => {
      cancelled = true;
    };
  }, [controller, opened]);

  return {
    capabilities,
    reloadCapabilities,
  };
}
