import { createElement, type ReactElement } from 'react';
import {
  IconAlertCircle,
  IconCamera,
  IconCheck,
  IconPlayerPause,
  IconRadar2,
  IconRefresh,
  IconShieldCheck,
  IconShieldX,
} from '@tabler/icons-react';

import type {
  ScannerPermissionStatus,
  ScannerScanningStatus,
} from '@/features/scanner/runtime/model/scanner-session.types.ts';

export type ScannerStatusTone = {
  color: string;
  icon: ReactElement;
};

const PERMISSION_TONE_BY_STATUS: Record<
  ScannerPermissionStatus,
  ScannerStatusTone
> = {
  denied: {
    color: 'red',
    icon: createElement(IconShieldX, { size: 12, stroke: 1.9 }),
  },
  granted: {
    color: 'green',
    icon: createElement(IconShieldCheck, { size: 12, stroke: 1.9 }),
  },
  idle: {
    color: 'gray',
    icon: createElement(IconAlertCircle, { size: 12, stroke: 1.9 }),
  },
  prompt: {
    color: 'yellow',
    icon: createElement(IconAlertCircle, { size: 12, stroke: 1.9 }),
  },
  unavailable: {
    color: 'red',
    icon: createElement(IconShieldX, { size: 12, stroke: 1.9 }),
  },
};

const PERMISSION_LABEL_BY_STATUS: Record<ScannerPermissionStatus, string> = {
  denied: 'Доступ запрещён',
  granted: 'Доступ разрешён',
  idle: 'Неизвестно',
  prompt: 'Запрос доступа',
  unavailable: 'Недоступно',
};

const SCANNING_TONE_BY_STATUS: Record<
  ScannerScanningStatus,
  ScannerStatusTone
> = {
  active: {
    color: 'green',
    icon: createElement(IconCamera, { size: 12, stroke: 1.9 }),
  },
  decoding: {
    color: 'violet',
    icon: createElement(IconRadar2, { size: 12, stroke: 1.9 }),
  },
  error: {
    color: 'red',
    icon: createElement(IconAlertCircle, { size: 12, stroke: 1.9 }),
  },
  idle: {
    color: 'gray',
    icon: createElement(IconPlayerPause, { size: 12, stroke: 1.9 }),
  },
  starting: {
    color: 'blue',
    icon: createElement(IconRefresh, { size: 12, stroke: 1.9 }),
  },
  stopping: {
    color: 'yellow',
    icon: createElement(IconPlayerPause, { size: 12, stroke: 1.9 }),
  },
  success: {
    color: 'green',
    icon: createElement(IconCheck, { size: 12, stroke: 1.9 }),
  },
  warning: {
    color: 'yellow',
    icon: createElement(IconAlertCircle, { size: 12, stroke: 1.9 }),
  },
};

const SCANNING_LABEL_BY_STATUS: Record<ScannerScanningStatus, string> = {
  active: 'Сканирование',
  decoding: 'Обработка',
  error: 'Ошибка',
  idle: 'Ожидание',
  starting: 'Запуск',
  stopping: 'Остановка',
  success: 'Успешно',
  warning: 'Дубликат',
};

export function getScannerPermissionLabel(
  status: ScannerPermissionStatus
): string {
  return PERMISSION_LABEL_BY_STATUS[status];
}

export function getScannerScanningLabel(status: ScannerScanningStatus): string {
  return SCANNING_LABEL_BY_STATUS[status];
}

export function getPermissionTone(
  permissionStatus: ScannerPermissionStatus
): ScannerStatusTone {
  return PERMISSION_TONE_BY_STATUS[permissionStatus];
}

export function getScanningTone(
  scanningStatus: ScannerScanningStatus
): ScannerStatusTone {
  return SCANNING_TONE_BY_STATUS[scanningStatus];
}
