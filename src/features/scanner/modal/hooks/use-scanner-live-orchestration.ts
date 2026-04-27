import { useCallback, useEffect, useRef } from 'react';
import { useDebouncedCallback, useThrottledCallback } from '@mantine/hooks';

import type { ScannerRuntimeControllerInstance } from '@/features/scanner/runtime/scanner-runtime.public.ts';

import {
  LIVE_REFRESH_DEBOUNCE_MS,
  LIVE_TOGGLE_THROTTLE_MS,
} from '../constants.ts';

interface UseScannerLiveOrchestrationInput {
  activeTab: 'live' | 'photo';
  controller: ScannerRuntimeControllerInstance;
  opened: boolean;
  previewElement: HTMLVideoElement | null;
  reloadCapabilities: () => Promise<unknown>;
  resolvedCameraId: string | null;
  scanningStatus: string;
  setIsOperationPending: (pending: boolean) => void;
}

export function useScannerLiveOrchestration({
  activeTab,
  controller,
  opened,
  previewElement,
  reloadCapabilities,
  resolvedCameraId,
  scanningStatus,
  setIsOperationPending,
}: UseScannerLiveOrchestrationInput) {
  const liveAutoStartedRef = useRef(false);
  const liveRefreshInFlightRef = useRef(false);
  const liveToggleInFlightRef = useRef(false);
  const previousTabRef = useRef(activeTab);

  const resetLiveAutoStart = useCallback((): void => {
    liveAutoStartedRef.current = false;
  }, []);

  const stopLiveForClose = useCallback(
    async (reason: 'session-close' | 'caller'): Promise<void> => {
      resetLiveAutoStart();
      await controller.stopLiveScan(reason);
    },
    [controller, resetLiveAutoStart]
  );

  const handleRetryLiveScan = useCallback(async (): Promise<void> => {
    if (previewElement === null) {
      return;
    }

    liveAutoStartedRef.current = true;
    setIsOperationPending(true);

    try {
      await controller.stopLiveScan('caller');
      await controller.startLiveScan({
        deviceId: resolvedCameraId,
        previewElement,
      });
    } finally {
      setIsOperationPending(false);
    }
  }, [controller, previewElement, resolvedCameraId, setIsOperationPending]);

  const handleRefreshLiveScanner = useCallback(async (): Promise<void> => {
    if (liveRefreshInFlightRef.current) {
      return;
    }

    liveRefreshInFlightRef.current = true;
    setIsOperationPending(true);

    try {
      await reloadCapabilities();

      if (activeTab === 'live' && previewElement !== null) {
        await handleRetryLiveScan();
      }
    } finally {
      liveRefreshInFlightRef.current = false;
      setIsOperationPending(false);
    }
  }, [
    activeTab,
    handleRetryLiveScan,
    previewElement,
    reloadCapabilities,
    setIsOperationPending,
  ]);

  const debouncedRefreshLiveScanner = useDebouncedCallback(() => {
    void handleRefreshLiveScanner();
  }, LIVE_REFRESH_DEBOUNCE_MS);

  const throttledToggleLiveScanner = useThrottledCallback(() => {
    if (liveToggleInFlightRef.current) {
      return;
    }

    liveToggleInFlightRef.current = true;

    const releaseLock = (): void => {
      liveToggleInFlightRef.current = false;
    };

    if (scanningStatus === 'starting' || scanningStatus === 'stopping') {
      releaseLock();
      return;
    }

    if (scanningStatus === 'active') {
      void controller.stopLiveScan('caller').finally(releaseLock);
      return;
    }

    void handleRetryLiveScan().finally(releaseLock);
  }, LIVE_TOGGLE_THROTTLE_MS);

  useEffect(() => {
    if (!opened) {
      resetLiveAutoStart();
      void controller.stopLiveScan('session-close');
    }
  }, [controller, opened, resetLiveAutoStart]);

  useEffect(() => {
    const previousTab = previousTabRef.current;
    previousTabRef.current = activeTab;

    if (!opened) {
      return;
    }

    if (previousTab === 'live' && activeTab === 'photo') {
      resetLiveAutoStart();
      void controller.stopLiveScan('tab-switch');
      return;
    }

    if (
      activeTab === 'live' &&
      previousTab !== 'live' &&
      previewElement !== null &&
      !liveAutoStartedRef.current
    ) {
      liveAutoStartedRef.current = true;
      void controller.startLiveScan({
        deviceId: resolvedCameraId,
        previewElement,
      });
    }
  }, [
    activeTab,
    controller,
    opened,
    previewElement,
    resetLiveAutoStart,
    resolvedCameraId,
  ]);

  useEffect(() => {
    if (
      !opened ||
      activeTab !== 'live' ||
      previewElement === null ||
      liveAutoStartedRef.current
    ) {
      return;
    }

    liveAutoStartedRef.current = true;
    void controller.startLiveScan({
      deviceId: resolvedCameraId,
      previewElement,
    });
  }, [activeTab, controller, opened, previewElement, resolvedCameraId]);

  return {
    debouncedRefreshLiveScanner,
    resetLiveAutoStart,
    stopLiveForClose,
    throttledToggleLiveScanner,
  };
}
