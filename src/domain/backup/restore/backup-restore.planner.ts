import {
  buildTargetRecords as buildRestoreTargetRecords,
  compareRestoreRecords,
} from '@/infrastructure/restore-core';

import {
  APP_BACKUP_PAYLOAD_VERSION,
  type AppBackupPayload,
} from '../app-backup.payload.ts';

import type { BackupRestoreConflict } from './backup-restore.conflict.ts';
import type { BackupRestoreInput } from './backup-restore.input.ts';
import type { BackupRestoreCommitPlan } from './backup-restore.plan.ts';
import type { BackupRestoreReport } from './backup-restore.report.ts';
import type {
  BackupRestoreBlockedResult,
  BackupRestoreResult,
} from './backup-restore.result.ts';
import type { BackupRestoreService } from './backup-restore.service.ts';

const BACKUP_TABLE_KEYS = [
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
] as const satisfies ReadonlyArray<keyof AppBackupPayload>;

type BackupTableKey = (typeof BACKUP_TABLE_KEYS)[number];

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
    BACKUP_TABLE_KEYS.every((key) => isArray(value[key]))
  );
}

function countRecords(
  payload: AppBackupPayload
): Record<BackupTableKey, number> {
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

function compareTableRecords<TRecord>(
  currentRecords: readonly TRecord[],
  importedRecords: readonly TRecord[],
  mode: BackupRestoreInput['mode'],
  getKey: (record: TRecord) => string,
  table: BackupRestoreConflict['table']
): BackupRestoreConflict[] {
  return compareRestoreRecords(
    currentRecords,
    importedRecords,
    mode,
    getKey,
    table
  ).map(
    (conflict): BackupRestoreConflict => ({
      ...conflict,
      scope: 'records',
    })
  );
}

function buildTargetState(input: BackupRestoreInput): AppBackupPayload {
  return {
    exportedAt: input.payload.exportedAt,
    version: input.payload.version,
    suppliers: buildRestoreTargetRecords(
      input.currentState.suppliers,
      input.payload.suppliers,
      input.mode,
      (record) => record.id
    ),
    categories: buildRestoreTargetRecords(
      input.currentState.categories,
      input.payload.categories,
      input.mode,
      (record) => record.id
    ),
    products: buildRestoreTargetRecords(
      input.currentState.products,
      input.payload.products,
      input.mode,
      (record) => record.id
    ),
    arrivals: buildRestoreTargetRecords(
      input.currentState.arrivals,
      input.payload.arrivals,
      input.mode,
      (record) => record.id
    ),
    departures: buildRestoreTargetRecords(
      input.currentState.departures,
      input.payload.departures,
      input.mode,
      (record) => record.id
    ),
    drafts: buildRestoreTargetRecords(
      input.currentState.drafts,
      input.payload.drafts,
      input.mode,
      (record) => record.id
    ),
    recordCodes: buildRestoreTargetRecords(
      input.currentState.recordCodes,
      input.payload.recordCodes,
      input.mode,
      (record) => record.id
    ),
    settings: buildRestoreTargetRecords(
      input.currentState.settings,
      input.payload.settings,
      input.mode,
      (record) => record.key
    ),
    favorites: buildRestoreTargetRecords(
      input.currentState.favorites,
      input.payload.favorites,
      input.mode,
      (record) => record.id
    ),
    profiles: buildRestoreTargetRecords(
      input.currentState.profiles,
      input.payload.profiles,
      input.mode,
      (record) => record.id
    ),
    backupCheckpoints: buildRestoreTargetRecords(
      input.currentState.backupCheckpoints,
      input.payload.backupCheckpoints,
      input.mode,
      (record) => record.id
    ),
    backupHistory: buildRestoreTargetRecords(
      input.currentState.backupHistory,
      input.payload.backupHistory,
      input.mode,
      (record) => record.id
    ),
  };
}

function createSummary(
  input: BackupRestoreInput,
  conflictCount: number
): string {
  if (input.mode === 'overwrite') {
    return conflictCount
      ? `Restore plan ready in overwrite mode with ${conflictCount} differing record(s)`
      : 'Restore plan ready in overwrite mode';
  }

  return conflictCount
    ? `Restore plan ready in ${input.mode} mode with ${conflictCount} overlapping record(s)`
    : `Restore plan ready in ${input.mode} mode`;
}

function createDetails(
  input: BackupRestoreInput,
  targetState: AppBackupPayload,
  conflicts: BackupRestoreConflict[]
): string {
  return JSON.stringify({
    mode: input.mode,
    payloadVersion: input.payload.version,
    currentVersion: input.currentState.version,
    historyWriteRequested: true,
    checkpointWriteRequested: input.checkpointRequested === true,
    checkpointLabel:
      input.checkpointRequested === true ? `restore:${input.mode}` : null,
    payloadCounts: countRecords(input.payload),
    currentCounts: countRecords(input.currentState),
    targetCounts: countRecords(targetState),
    conflictCount: conflicts.length,
  });
}

function createBlockedReport(
  input: BackupRestoreInput,
  code: BackupRestoreBlockedResult['code'],
  message: string
): BackupRestoreReport {
  return {
    action: 'restore-plan',
    status: 'blocked',
    readyToCommit: false,
    mode: input.mode,
    payloadVersion: isBackupPayloadCandidate(input.payload)
      ? input.payload.version
      : null,
    historyWriteRequested: true,
    checkpointWriteRequested: input.checkpointRequested === true,
    conflicts: [
      {
        table: 'backupHistory',
        recordId: code,
        scope: code === 'INVALID_PAYLOAD' ? 'payload' : 'version',
        path: code === 'INVALID_PAYLOAD' ? 'payload' : 'version',
        code: 'WRITE_BLOCKED',
        message,
      },
    ],
    plan: null,
    summary: message,
    details: JSON.stringify({
      mode: input.mode,
      code,
      message,
    }),
  };
}

function createReadyReport(
  input: BackupRestoreInput,
  plan: BackupRestoreCommitPlan,
  conflicts: BackupRestoreConflict[],
  summary: string,
  details: string
): BackupRestoreReport {
  return {
    action: 'restore-plan',
    status: 'ready',
    readyToCommit: true,
    mode: input.mode,
    payloadVersion: input.payload.version,
    historyWriteRequested: true,
    checkpointWriteRequested: input.checkpointRequested === true,
    conflicts,
    plan,
    summary,
    details,
  };
}

/**
 * Backup-specific planner that adapts reusable restore-core mechanics to the
 * canonical backup payload.
 *
 * Role:
 * - validates backup payload shape/version for restore planning
 * - builds the backup commit plan and report
 * - maps generic restore-core conflicts into backup-specific conflict records
 *
 * Non-goals:
 * - no Dexie transaction ownership
 * - no checkpoint/history persistence
 * - no browser/file I/O
 */
export class BackupRestorePlanner implements BackupRestoreService {
  public execute(input: BackupRestoreInput): Promise<BackupRestoreResult> {
    if (!isBackupPayloadCandidate(input.payload)) {
      return Promise.resolve({
        ok: false,
        code: 'INVALID_PAYLOAD',
        report: createBlockedReport(
          input,
          'INVALID_PAYLOAD',
          'Imported backup payload is invalid'
        ),
      });
    }

    if (!isBackupPayloadCandidate(input.currentState)) {
      return Promise.resolve({
        ok: false,
        code: 'INVALID_PAYLOAD',
        report: createBlockedReport(
          input,
          'INVALID_PAYLOAD',
          'Current backup payload is invalid'
        ),
      });
    }

    if (input.payload.version !== APP_BACKUP_PAYLOAD_VERSION) {
      return Promise.resolve({
        ok: false,
        code: 'UNSUPPORTED_VERSION',
        report: createBlockedReport(
          input,
          'UNSUPPORTED_VERSION',
          `Unsupported backup payload version ${input.payload.version}; expected ${APP_BACKUP_PAYLOAD_VERSION}`
        ),
      });
    }

    if (input.currentState.version !== APP_BACKUP_PAYLOAD_VERSION) {
      return Promise.resolve({
        ok: false,
        code: 'UNSUPPORTED_VERSION',
        report: createBlockedReport(
          input,
          'UNSUPPORTED_VERSION',
          `Current backup payload version ${input.currentState.version} is unsupported; expected ${APP_BACKUP_PAYLOAD_VERSION}`
        ),
      });
    }

    const targetState = buildTargetState(input);
    const conflicts = [
      ...compareTableRecords(
        input.currentState.suppliers,
        input.payload.suppliers,
        input.mode,
        (record) => record.id,
        'suppliers'
      ),
      ...compareTableRecords(
        input.currentState.categories,
        input.payload.categories,
        input.mode,
        (record) => record.id,
        'categories'
      ),
      ...compareTableRecords(
        input.currentState.products,
        input.payload.products,
        input.mode,
        (record) => record.id,
        'products'
      ),
      ...compareTableRecords(
        input.currentState.arrivals,
        input.payload.arrivals,
        input.mode,
        (record) => record.id,
        'arrivals'
      ),
      ...compareTableRecords(
        input.currentState.departures,
        input.payload.departures,
        input.mode,
        (record) => record.id,
        'departures'
      ),
      ...compareTableRecords(
        input.currentState.drafts,
        input.payload.drafts,
        input.mode,
        (record) => record.id,
        'drafts'
      ),
      ...compareTableRecords(
        input.currentState.recordCodes,
        input.payload.recordCodes,
        input.mode,
        (record) => record.id,
        'recordCodes'
      ),
      ...compareTableRecords(
        input.currentState.settings,
        input.payload.settings,
        input.mode,
        (record) => record.key,
        'settings'
      ),
      ...compareTableRecords(
        input.currentState.favorites,
        input.payload.favorites,
        input.mode,
        (record) => record.id,
        'favorites'
      ),
      ...compareTableRecords(
        input.currentState.profiles,
        input.payload.profiles,
        input.mode,
        (record) => record.id,
        'profiles'
      ),
      ...compareTableRecords(
        input.currentState.backupCheckpoints,
        input.payload.backupCheckpoints,
        input.mode,
        (record) => record.id,
        'backupCheckpoints'
      ),
      ...compareTableRecords(
        input.currentState.backupHistory,
        input.payload.backupHistory,
        input.mode,
        (record) => record.id,
        'backupHistory'
      ),
    ];

    const historyWriteRequested = true;
    const checkpointWriteRequested = input.checkpointRequested === true;
    const checkpointLabel = checkpointWriteRequested
      ? `restore:${input.mode}`
      : null;
    const summary = createSummary(input, conflicts.length);
    const details = createDetails(input, targetState, conflicts);

    const plan: BackupRestoreCommitPlan = {
      mode: input.mode,
      payload: input.payload,
      currentState: input.currentState,
      targetState,
      historyWriteRequested,
      checkpointWriteRequested,
      checkpointLabel,
      conflicts,
      summary,
      details,
    };

    return Promise.resolve({
      ok: true,
      payload: input.payload,
      plan,
      report: createReadyReport(input, plan, conflicts, summary, details),
    });
  }
}
