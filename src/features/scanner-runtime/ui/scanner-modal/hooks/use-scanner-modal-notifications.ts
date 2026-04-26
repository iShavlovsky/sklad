import { useEffect, useRef } from 'react';

import { useActionFeedback } from '@/shared/ui/action-feedback';

import { getScannerErrorMessage } from '../error-presentation.ts';
import type { ScannerLatestBufferItem } from '../view-state.ts';

type UseScannerModalNotificationsInput = {
  errorCode: string | null;
  errorMessage: string | null;
  latestBufferItem: ScannerLatestBufferItem;
  opened: boolean;
  scanningStatus: string;
  statusMessage: string | null;
  visibleTab: 'live' | 'photo';
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
    if (!opened || errorCode !== 'decode-failed') {
      return;
    }

    if (visibleTab !== 'photo') {
      return;
    }

    actionFeedback.notify({
      id: `scanner-photo-${errorCode}`,
      autoClose: 4000,
      kind: 'error',
      message: getScannerErrorMessage('decode-failed'),
      title: 'Сканер',
    });
    clearError();
  }, [actionFeedback, clearError, errorCode, opened, visibleTab]);

  useEffect(() => {
    if (
      !opened ||
      scanningStatus !== 'success' ||
      latestBufferItem === null ||
      (latestBufferItem.source !== 'scanner-live' &&
        latestBufferItem.source !== 'scanner-photo')
    ) {
      return;
    }

    const notificationKey = `${latestBufferItem.source}:${latestBufferItem.value}`;
    if (lastSuccessNotificationKeyRef.current === notificationKey) {
      return;
    }

    lastSuccessNotificationKeyRef.current = notificationKey;
    actionFeedback.notify({
      id: 'scanner-decode-succeeded',
      autoClose: 2500,
      kind: 'success',
      title: 'Код добавлен в буфер',
      message: latestBufferItem.value,
    });
  }, [actionFeedback, latestBufferItem, opened, scanningStatus]);

  useEffect(() => {
    if (!opened || scanningStatus !== 'warning' || statusMessage === null) {
      return;
    }

    if (lastWarningNotificationKeyRef.current === statusMessage) {
      return;
    }

    lastWarningNotificationKeyRef.current = statusMessage;
    actionFeedback.notify({
      id: 'scanner-decode-duplicate',
      autoClose: 4500,
      kind: 'warning',
      title: 'Сканер',
      message: statusMessage,
    });
  }, [actionFeedback, opened, scanningStatus, statusMessage]);

  useEffect(() => {
    if (!opened) {
      lastSuccessNotificationKeyRef.current = null;
      lastWarningNotificationKeyRef.current = null;
    }
  }, [opened]);
}
