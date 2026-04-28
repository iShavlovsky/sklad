import type {
  AppBackupPayload,
  BackupImportValidationResult,
  BackupRestoreMode,
} from '@/domain/backup';
import { APP_BACKUP_PAYLOAD_VERSION } from '@/domain/backup';

export const CHECKPOINT_EXPORT_PAIRING_WINDOW_MS = 15_000;

export const restoreModes: Array<{
  value: BackupRestoreMode;
  label: string;
  description: string;
}> = [
  {
    value: 'overwrite',
    label: 'Заменить',
    description: 'Заменяет first data состоянием из файла.',
  },
  {
    value: 'merge',
    label: 'Объединить',
    description: 'Добавляет импорт и заменяет совпадающие записи.',
  },
  {
    value: 'rebase',
    label: 'Сохранить текущее',
    description: 'Добавляет только то, чего еще нет в текущей базе.',
  },
];

export function createEmptyBackupPayload(): AppBackupPayload {
  return {
    exportedAt: new Date(0).toISOString(),
    version: APP_BACKUP_PAYLOAD_VERSION,
    suppliers: [],
    categories: [],
    products: [],
    arrivals: [],
    departures: [],
    drafts: [],
    recordCodes: [],
    settings: [],
    favorites: [],
    profiles: [],
    backupCheckpoints: [],
    backupHistory: [],
  };
}

export function formatDateTime(value: string): string {
  const timestamp = Date.parse(value);

  if (Number.isNaN(timestamp)) {
    return value;
  }

  return new Intl.DateTimeFormat('ru-RU', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(timestamp);
}

export function summarizeValidation(
  validation: BackupImportValidationResult | null
): string {
  if (validation === null) {
    return 'Файл еще не проверен.';
  }

  if (!validation.ok || validation.report.counts === null) {
    return validation.report.summary;
  }

  const { counts } = validation.report;

  return [
    `приходы: ${counts.arrivals}`,
    `отгрузки: ${counts.departures}`,
    `черновики: ${counts.drafts}`,
    `коды: ${counts.recordCodes}`,
    `настройки: ${counts.settings}`,
  ].join(', ');
}
