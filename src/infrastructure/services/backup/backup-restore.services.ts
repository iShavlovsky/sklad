import {
  type BackupCheckpointRecord,
  BackupCheckpointService,
  type BackupHistoryRecord,
  type BackupRestoreBlockedResult,
  type BackupRestoreInput,
  BackupRestorePlanner,
  type BackupRestoreReadyResult,
} from '@/domain/backup';
import type { AppBackupPayload } from '@/domain/backup/app-backup.payload.ts';
import { appDb } from '@/infrastructure/db';
import { BackupCheckpointRepository } from '@/infrastructure/repositories/backup/backup-checkpoint.repository.ts';
import { BackupHistoryRepository } from '@/infrastructure/repositories/backup/backup-history.repository.ts';
import { RecordCodeRepository } from '@/infrastructure/repositories/codes/record-code.repository.ts';
import { CategoryRepository } from '@/infrastructure/repositories/directories/category.repository.ts';
import { ProductRepository } from '@/infrastructure/repositories/directories/product.repository.ts';
import { SupplierRepository } from '@/infrastructure/repositories/directories/supplier.repository.ts';
import { ArrivalRepository } from '@/infrastructure/repositories/journals/arrival.repository.ts';
import { DepartureRepository } from '@/infrastructure/repositories/journals/departure.repository.ts';
import { DraftRepository } from '@/infrastructure/repositories/journals/draft.repository.ts';
import { FavoriteRepository } from '@/infrastructure/repositories/personalization/favorite.repository.ts';
import { ProfileRepository } from '@/infrastructure/repositories/personalization/profile.repository.ts';
import { SettingsRepository } from '@/infrastructure/repositories/personalization/settings.repository.ts';

import {
  clearAndPut,
  createBackupRestoreHistoryRecord,
} from './backup-restore.commit.ts';
import { readBackupRestoreCurrentState } from './backup-restore.state.ts';

/**
 * Successful backup restore execution after planning and durable commit.
 */
export interface BackupRestoreServiceFacadeSuccess extends BackupRestoreReadyResult {
  readonly ok: true;
  readonly committedAt: string;
  readonly historyRecord: BackupHistoryRecord;
  readonly checkpointRecord: BackupCheckpointRecord | null;
}

/**
 * Failed backup restore execution after infrastructure orchestration fails.
 */
export interface BackupRestoreServiceFacadeFailure {
  readonly ok: false;
  readonly code: 'DB_WRITE_FAILED';
}

/**
 * Full restore-service result union after planner execution and durable writes.
 */
export type BackupRestoreServiceFacadeResult =
  | BackupRestoreBlockedResult
  | BackupRestoreServiceFacadeSuccess
  | BackupRestoreServiceFacadeFailure;

/**
 * Infrastructure-facing restore facade consumed by the backup feature hook.
 */
export interface BackupRestoreServiceFacade {
  execute(input: BackupRestoreInput): Promise<BackupRestoreServiceFacadeResult>;
}

async function persistPayload(payload: AppBackupPayload): Promise<void> {
  await clearAndPut(appDb.suppliers, payload.suppliers);
  await clearAndPut(appDb.categories, payload.categories);
  await clearAndPut(appDb.products, payload.products);
  await clearAndPut(appDb.arrivals, payload.arrivals);
  await clearAndPut(appDb.departures, payload.departures);
  await clearAndPut(appDb.drafts, payload.drafts);
  await clearAndPut(appDb.recordCodes, payload.recordCodes);
  await clearAndPut(appDb.settings, payload.settings);
  await clearAndPut(appDb.favorites, payload.favorites);
  await clearAndPut(appDb.profiles, payload.profiles);
  await clearAndPut(appDb.backupCheckpoints, payload.backupCheckpoints);
  await clearAndPut(appDb.backupHistory, payload.backupHistory);
}

/**
 * Creates the backup restore orchestration facade.
 *
 * It keeps Dexie transaction scope, current-state capture, payload commit, and
 * checkpoint/history persistence outside the reusable restore core.
 */
export function createBackupRestoreService(): BackupRestoreServiceFacade {
  const supplierRepository = new SupplierRepository(appDb.suppliers);
  const categoryRepository = new CategoryRepository(appDb.categories);
  const productRepository = new ProductRepository(appDb.products);
  const arrivalRepository = new ArrivalRepository(appDb.arrivals);
  const departureRepository = new DepartureRepository(appDb.departures);
  const draftRepository = new DraftRepository(appDb.drafts);
  const recordCodeRepository = new RecordCodeRepository(appDb.recordCodes);
  const settingsRepository = new SettingsRepository(appDb.settings);
  const favoriteRepository = new FavoriteRepository(appDb.favorites);
  const profileRepository = new ProfileRepository(appDb.profiles);
  const backupCheckpointRepository = new BackupCheckpointRepository(
    appDb.backupCheckpoints
  );
  const backupHistoryRepository = new BackupHistoryRepository(
    appDb.backupHistory
  );
  const backupCheckpointService = new BackupCheckpointService();
  const backupRestorePlanner = new BackupRestorePlanner();

  return {
    async execute(
      input: BackupRestoreInput
    ): Promise<BackupRestoreServiceFacadeResult> {
      try {
        return await appDb.transaction(
          'rw',
          [
            appDb.suppliers,
            appDb.categories,
            appDb.products,
            appDb.arrivals,
            appDb.departures,
            appDb.drafts,
            appDb.recordCodes,
            appDb.settings,
            appDb.favorites,
            appDb.profiles,
            appDb.backupCheckpoints,
            appDb.backupHistory,
          ],
          async () => {
            const currentState = await readBackupRestoreCurrentState({
              supplierRepository,
              categoryRepository,
              productRepository,
              arrivalRepository,
              departureRepository,
              draftRepository,
              recordCodeRepository,
              settingsRepository,
              favoriteRepository,
              profileRepository,
              backupCheckpointRepository,
              backupHistoryRepository,
            });

            const planning = await backupRestorePlanner.execute({
              ...input,
              currentState,
            });

            if (!planning.ok) {
              return planning;
            }

            const committedAt = new Date().toISOString();

            await persistPayload(planning.plan.targetState);

            const historyRecord = createBackupRestoreHistoryRecord(
              planning.plan.summary,
              planning.plan.details,
              committedAt,
              planning.plan.checkpointWriteRequested,
              planning.plan.checkpointLabel,
              planning.plan.targetState
            );

            await backupHistoryRepository.put(historyRecord);

            let checkpointRecord: BackupCheckpointRecord | null = null;

            if (planning.plan.checkpointWriteRequested) {
              const checkpointSnapshot: AppBackupPayload = {
                ...planning.plan.targetState,
                backupHistory: [
                  ...planning.plan.targetState.backupHistory,
                  historyRecord,
                ],
              };

              const { checkpointRecord: createdCheckpointRecord } =
                backupCheckpointService.execute({
                  label:
                    planning.plan.checkpointLabel ??
                    `restore:${planning.plan.mode}`,
                  snapshot: checkpointSnapshot,
                  createdAt: committedAt,
                });

              checkpointRecord = createdCheckpointRecord;

              await backupCheckpointRepository.put(checkpointRecord);
            }

            return {
              ok: true,
              payload: planning.payload,
              plan: planning.plan,
              report: planning.report,
              committedAt,
              historyRecord,
              checkpointRecord,
            };
          }
        );
      } catch {
        return {
          ok: false,
          code: 'DB_WRITE_FAILED',
        };
      }
    },
  };
}
