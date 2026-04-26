import {
  type BackupCheckpointRecord,
  type BackupExportInput,
  type BackupExportOutput,
  BackupExportService,
  type BackupHistoryRecord,
} from '@/domain/backup';
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

export interface BackupExportServiceResult extends BackupExportOutput {
  readonly ok: true;
}

export interface BackupExportServiceFailure {
  readonly ok: false;
  readonly code: 'DB_WRITE_FAILED';
}

export type BackupExportServiceFacadeResult =
  | BackupExportServiceResult
  | BackupExportServiceFailure;

export interface BackupExportServiceFacade {
  execute(): Promise<BackupExportServiceFacadeResult>;
}

function toBackupExportInput(
  backupCheckpoints: BackupCheckpointRecord[],
  backupHistory: BackupHistoryRecord[],
  suppliers: Awaited<ReturnType<SupplierRepository['list']>>,
  categories: Awaited<ReturnType<CategoryRepository['list']>>,
  products: Awaited<ReturnType<ProductRepository['list']>>,
  arrivals: Awaited<ReturnType<ArrivalRepository['list']>>,
  departures: Awaited<ReturnType<DepartureRepository['list']>>,
  drafts: Awaited<ReturnType<DraftRepository['list']>>,
  recordCodes: Awaited<ReturnType<RecordCodeRepository['list']>>,
  settings: Awaited<ReturnType<SettingsRepository['list']>>,
  favorites: Awaited<ReturnType<FavoriteRepository['list']>>,
  profiles: Awaited<ReturnType<ProfileRepository['list']>>
): BackupExportInput {
  return {
    exportedAt: new Date().toISOString(),
    suppliers,
    categories,
    products,
    arrivals,
    departures,
    drafts,
    recordCodes,
    settings,
    favorites,
    profiles,
    backupCheckpoints,
    backupHistory,
  };
}

export function createBackupExportService(): BackupExportServiceFacade {
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
  const backupExportService = new BackupExportService();

  return {
    async execute(): Promise<BackupExportServiceFacadeResult> {
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
            const suppliers = await supplierRepository.list();
            const categories = await categoryRepository.list();
            const products = await productRepository.list();
            const arrivals = await arrivalRepository.list();
            const departures = await departureRepository.list();
            const drafts = await draftRepository.list();
            const recordCodes = await recordCodeRepository.list();
            const settings = await settingsRepository.list();
            const favorites = await favoriteRepository.list();
            const profiles = await profileRepository.list();
            const backupCheckpoints = await backupCheckpointRepository.list();
            const backupHistory = await backupHistoryRepository.list();

            const input = toBackupExportInput(
              backupCheckpoints,
              backupHistory,
              suppliers,
              categories,
              products,
              arrivals,
              departures,
              drafts,
              recordCodes,
              settings,
              favorites,
              profiles
            );

            const result = backupExportService.execute(input);
            await backupHistoryRepository.put(result.historyRecord);

            return {
              ok: true,
              ...result,
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
