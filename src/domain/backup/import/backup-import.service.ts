import type { ValidationIssue } from '@/domain/validation/validation-issue.ts';

import {
  APP_BACKUP_PAYLOAD_VERSION,
  type AppBackupPayload,
} from '../app-backup.payload.ts';

import type {
  BackupImportCounts,
  BackupImportReport,
} from './backup-import.report.ts';
import type { BackupImportValidationResult } from './backup-import.result.ts';

const BACKUP_GROUP_KEYS = [
  'suppliers',
  'categories',
  'products',
  'arrivals',
  'departures',
  'drafts',
  'recordCodes',
  'settings',
  'favorites',
  'profiles',
  'backupCheckpoints',
  'backupHistory',
] as const;

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isArray(value: unknown): value is unknown[] {
  return Array.isArray(value);
}

function isBackupPayloadCandidate(value: unknown): value is AppBackupPayload {
  if (!isObject(value)) {
    return false;
  }

  return (
    typeof value.exportedAt === 'string' &&
    typeof value.version === 'number' &&
    BACKUP_GROUP_KEYS.every((key) => isArray(value[key]))
  );
}

function countRecords(payload: AppBackupPayload): BackupImportCounts {
  return {
    suppliers: payload.suppliers.length,
    categories: payload.categories.length,
    products: payload.products.length,
    arrivals: payload.arrivals.length,
    departures: payload.departures.length,
    drafts: payload.drafts.length,
    recordCodes: payload.recordCodes.length,
    settings: payload.settings.length,
    favorites: payload.favorites.length,
    profiles: payload.profiles.length,
    backupCheckpoints: payload.backupCheckpoints.length,
    backupHistory: payload.backupHistory.length,
  };
}

function normalizeQuantityCostRecord<TRecord extends Record<string, unknown>>(
  record: TRecord
): TRecord {
  const amount = typeof record.amount === 'number' ? record.amount : null;
  const currency = typeof record.currency === 'string' ? record.currency : null;
  const hasCurrency = currency !== null && currency.trim() !== '';
  const quantity =
    typeof record.quantity === 'number'
      ? record.quantity
      : !hasCurrency && amount !== null
        ? amount
        : null;
  const totalCost =
    typeof record.totalCost === 'number'
      ? record.totalCost
      : hasCurrency
        ? amount
        : null;
  const unitCost =
    typeof record.unitCost === 'number'
      ? record.unitCost
      : quantity !== null && quantity > 0 && totalCost !== null
        ? totalCost / quantity
        : null;

  return {
    ...record,
    quantity,
    totalCost,
    unitCost,
  };
}

function normalizeDraftPayload(payload: unknown): unknown {
  if (!isObject(payload)) {
    return payload;
  }

  if (isObject(payload.quantityCost)) {
    return payload;
  }

  const money = isObject(payload.money) ? payload.money : {};
  const amount = typeof money.amount === 'number' ? money.amount : null;
  const currency = typeof money.currency === 'string' ? money.currency : null;
  const hasCurrency = currency !== null && currency.trim() !== '';
  const quantity = !hasCurrency && amount !== null ? amount : null;
  const totalCost = hasCurrency ? amount : null;

  return {
    ...payload,
    quantityCost: {
      quantity,
      totalCost,
      unitCost:
        quantity !== null && quantity > 0 && totalCost !== null
          ? totalCost / quantity
          : null,
    },
  };
}

function normalizeBackupPayload(payload: AppBackupPayload): AppBackupPayload {
  return {
    ...payload,
    arrivals: payload.arrivals.map((record) =>
      normalizeQuantityCostRecord(record as unknown as Record<string, unknown>)
    ) as unknown as AppBackupPayload['arrivals'],
    departures: payload.departures.map((record) =>
      normalizeQuantityCostRecord(record as unknown as Record<string, unknown>)
    ) as unknown as AppBackupPayload['departures'],
    drafts: payload.drafts.map((record) => ({
      ...record,
      payload: normalizeDraftPayload(record.payload),
    })) as AppBackupPayload['drafts'],
  };
}

function createIssue(
  path: string,
  code: ValidationIssue['code'],
  message: string
): ValidationIssue {
  return {
    path,
    code,
    message,
  };
}

function createErrorReport(
  payloadVersion: number | null,
  issues: ValidationIssue[]
): BackupImportReport {
  return {
    action: 'import-dry-run',
    status: 'error',
    readyToCommit: false,
    expectedVersion: APP_BACKUP_PAYLOAD_VERSION,
    payloadVersion,
    counts: null,
    issues,
    summary: issues.length
      ? 'Backup payload failed validation'
      : 'Backup payload could not be validated',
    details: JSON.stringify({
      payloadVersion,
      expectedVersion: APP_BACKUP_PAYLOAD_VERSION,
      issues,
    }),
  };
}

function createSuccessReport(
  payload: AppBackupPayload,
  counts: BackupImportCounts
): BackupImportReport {
  return {
    action: 'import-dry-run',
    status: 'success',
    readyToCommit: true,
    expectedVersion: APP_BACKUP_PAYLOAD_VERSION,
    payloadVersion: payload.version,
    counts,
    issues: [],
    summary: `Backup payload validated for version ${payload.version}`,
    details: JSON.stringify({
      payloadVersion: payload.version,
      expectedVersion: APP_BACKUP_PAYLOAD_VERSION,
      counts,
    }),
  };
}

export class BackupImportValidationService {
  public execute(input: unknown): BackupImportValidationResult {
    if (!isBackupPayloadCandidate(input)) {
      return {
        ok: false,
        code: 'INVALID_PAYLOAD',
        report: createErrorReport(
          isObject(input) && typeof input.version === 'number'
            ? input.version
            : null,
          [
            createIssue(
              '',
              'invalid_type',
              'Backup payload must be an object with the canonical groups'
            ),
          ]
        ),
      };
    }

    if (input.version !== APP_BACKUP_PAYLOAD_VERSION) {
      return {
        ok: false,
        code: 'UNSUPPORTED_VERSION',
        report: createErrorReport(input.version, [
          createIssue(
            'version',
            'invalid_value',
            `Unsupported backup payload version ${input.version}; expected ${APP_BACKUP_PAYLOAD_VERSION}`
          ),
        ]),
      };
    }

    const payload = normalizeBackupPayload(input);
    const counts = countRecords(payload);

    return {
      ok: true,
      payload,
      report: createSuccessReport(payload, counts),
    };
  }
}
