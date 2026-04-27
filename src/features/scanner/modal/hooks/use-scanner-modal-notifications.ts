import { useEffect, useRef } from 'react';

import type {
  ScannerScanningStatus,
  ScannerSessionErrorCode,
  ScannerSessionTab,
} from '@/features/scanner/runtime/model/scanner-session.types.ts';
import { useActionFeedback } from '@/shared/ui/action-feedback';

import {
  resolveDecodeFailedNotification,
  resolveDecodeSucceededNotification,
  resolveDecodeWarningNotification,
} from '../notification-events.ts';
import type { ScannerLatestBufferItem } from '../view-state.ts';

type UseScannerModalNotificationsInput = {
  errorCode: ScannerSessionErrorCode | null;
  errorMessage: string | null;
  latestBufferItem: ScannerLatestBufferItem;
  opened: boolean;
  scanningStatus: ScannerScanningStatus;
  statusMessage: string | null;
  visibleTab: ScannerSessionTab;
  clearError: () => void;
};

export function useScannerModalNotifications({
  clearError,
  errorCode,
  latestBufferItem,
  opened,
  scanningStatus,
  statusMessage,
  visibleTab,
}: Readonly<UseScannerModalNotificationsInput>): void {
  const actionFeedback = useActionFeedback();
  const lastSuccessNotificationKeyRef = useRef<string | null>(null);
  const lastWarningNotificationKeyRef = useRef<string | null>(null);

  useEffect(() => {
    const event = resolveDecodeFailedNotification({
      errorCode,
      opened,
      visibleTab,
    });
    if (event === null) {
      return;
    }

    actionFeedback.notify(event.feedback);
    clearError();
  }, [actionFeedback, clearError, errorCode, opened, visibleTab]);

  useEffect(() => {
    const event = resolveDecodeSucceededNotification({
      lastNotificationKey: lastSuccessNotificationKeyRef.current,
      latestBufferItem,
      opened,
      scanningStatus,
    });
    if (event === null) {
      return;
    }

    lastSuccessNotificationKeyRef.current = event.notificationKey;
    actionFeedback.notify(event.feedback);
  }, [actionFeedback, latestBufferItem, opened, scanningStatus]);

  useEffect(() => {
    const event = resolveDecodeWarningNotification({
      lastNotificationKey: lastWarningNotificationKeyRef.current,
      opened,
      scanningStatus,
      statusMessage,
    });
    if (event === null) {
      return;
    }

    lastWarningNotificationKeyRef.current = event.notificationKey;
    actionFeedback.notify(event.feedback);
  }, [actionFeedback, opened, scanningStatus, statusMessage]);

  useEffect(() => {
    if (!opened) {
      lastSuccessNotificationKeyRef.current = null;
      lastWarningNotificationKeyRef.current = null;
    }
  }, [opened]);
}
