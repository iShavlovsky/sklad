import type {
  ScannerScanningStatus,
  ScannerSessionErrorCode,
  ScannerSessionTab,
} from '@/features/scanner/runtime/model/scanner-session.types.ts';
import type { ActionFeedbackInput } from '@/shared/ui/action-feedback';

import { getScannerErrorMessage } from './error-presentation.ts';
import type { ScannerLatestBufferItem } from './view-state.ts';

type DecodeFailedNotificationInput = {
  errorCode: ScannerSessionErrorCode | null;
  opened: boolean;
  visibleTab: ScannerSessionTab;
};

type DecodeSucceededNotificationInput = {
  lastNotificationKey: string | null;
  latestBufferItem: ScannerLatestBufferItem;
  opened: boolean;
  scanningStatus: ScannerScanningStatus;
};

type DecodeWarningNotificationInput = {
  lastNotificationKey: string | null;
  opened: boolean;
  scanningStatus: ScannerScanningStatus;
  statusMessage: string | null;
};

type DecodeFailedNotificationEvent = {
  feedback: ActionFeedbackInput;
  kind: 'decode-failed';
};

type DecodeSucceededNotificationEvent = {
  feedback: ActionFeedbackInput;
  kind: 'decode-succeeded';
  notificationKey: string;
};

type DecodeWarningNotificationEvent = {
  feedback: ActionFeedbackInput;
  kind: 'decode-warning';
  notificationKey: string;
};

export type ScannerNotificationEvent =
  | DecodeFailedNotificationEvent
  | DecodeSucceededNotificationEvent
  | DecodeWarningNotificationEvent;

export function resolveDecodeFailedNotification(
  input: Readonly<DecodeFailedNotificationInput>
): DecodeFailedNotificationEvent | null {
  if (!input.opened || input.errorCode !== 'decode-failed') {
    return null;
  }

  if (input.visibleTab !== 'photo') {
    return null;
  }

  return {
    kind: 'decode-failed',
    feedback: {
      id: `scanner-photo-${input.errorCode}`,
      autoClose: 4000,
      kind: 'error',
      message: getScannerErrorMessage('decode-failed'),
      title: 'Сканер',
    },
  };
}

export function resolveDecodeSucceededNotification(
  input: Readonly<DecodeSucceededNotificationInput>
): DecodeSucceededNotificationEvent | null {
  if (
    !input.opened ||
    input.scanningStatus !== 'success' ||
    input.latestBufferItem === null ||
    (input.latestBufferItem.source !== 'scanner-live' &&
      input.latestBufferItem.source !== 'scanner-photo')
  ) {
    return null;
  }

  const notificationKey = `${input.latestBufferItem.source}:${input.latestBufferItem.value}`;
  if (input.lastNotificationKey === notificationKey) {
    return null;
  }

  return {
    kind: 'decode-succeeded',
    notificationKey,
    feedback: {
      id: 'scanner-decode-succeeded',
      autoClose: 2500,
      kind: 'success',
      title: 'Код добавлен в буфер',
      message: input.latestBufferItem.value,
    },
  };
}

export function resolveDecodeWarningNotification(
  input: Readonly<DecodeWarningNotificationInput>
): DecodeWarningNotificationEvent | null {
  if (
    !input.opened ||
    input.scanningStatus !== 'warning' ||
    input.statusMessage === null
  ) {
    return null;
  }

  if (input.lastNotificationKey === input.statusMessage) {
    return null;
  }

  return {
    kind: 'decode-warning',
    notificationKey: input.statusMessage,
    feedback: {
      id: 'scanner-decode-duplicate',
      autoClose: 4500,
      kind: 'warning',
      title: 'Сканер',
      message: input.statusMessage,
    },
  };
}
