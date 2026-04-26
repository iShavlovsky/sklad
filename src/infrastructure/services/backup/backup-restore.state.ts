import { APP_BACKUP_PAYLOAD_VERSION } from '@/domain/backup';
import type { AppBackupPayload } from '@/domain/backup/app-backup.payload.ts';
import type { BackupCheckpointRepository } from '@/infrastructure/repositories/backup/backup-checkpoint.repository.ts';
import type { BackupHistoryRepository } from '@/infrastructure/repositories/backup/backup-history.repository.ts';
import type { RecordCodeRepository } from '@/infrastructure/repositories/codes/record-code.repository.ts';
import type { CategoryRepository } from '@/infrastructure/repositories/directories/category.repository.ts';
import type { ProductRepository } from '@/infrastructure/repositories/directories/product.repository.ts';
import type { SupplierRepository } from '@/infrastructure/repositories/directories/supplier.repository.ts';
import type { ArrivalRepository } from '@/infrastructure/repositories/journals/arrival.repository.ts';
import type { DepartureRepository } from '@/infrastructure/repositories/journals/departure.repository.ts';
import type { DraftRepository } from '@/infrastructure/repositories/journals/draft.repository.ts';
import type { FavoriteRepository } from '@/infrastructure/repositories/personalization/favorite.repository.ts';
import type { ProfileRepository } from '@/infrastructure/repositories/personalization/profile.repository.ts';
import type { SettingsRepository } from '@/infrastructure/repositories/personalization/settings.repository.ts';

export interface BackupRestoreCurrentStateDependencies {
  readonly supplierRepository: SupplierRepository;
  readonly categoryRepository: CategoryRepository;
  readonly productRepository: ProductRepository;
  readonly arrivalRepository: ArrivalRepository;
  readonly departureRepository: DepartureRepository;
  readonly draftRepository: DraftRepository;
  readonly recordCodeRepository: RecordCodeRepository;
  readonly settingsRepository: SettingsRepository;
  readonly favoriteRepository: FavoriteRepository;
  readonly profileRepository: ProfileRepository;
  readonly backupCheckpointRepository: BackupCheckpointRepository;
  readonly backupHistoryRepository: BackupHistoryRepository;
}

export async function readBackupRestoreCurrentState(
  dependencies: BackupRestoreCurrentStateDependencies
): Promise<AppBackupPayload> {
  const [
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
  ] = await Promise.all([
    dependencies.supplierRepository.list(),
    dependencies.categoryRepository.list(),
    dependencies.productRepository.list(),
    dependencies.arrivalRepository.list(),
    dependencies.departureRepository.list(),
    dependencies.draftRepository.list(),
    dependencies.recordCodeRepository.list(),
    dependencies.settingsRepository.list(),
    dependencies.favoriteRepository.list(),
    dependencies.profileRepository.list(),
    dependencies.backupCheckpointRepository.list(),
    dependencies.backupHistoryRepository.list(),
  ]);

  return {
    exportedAt: new Date().toISOString(),
    version: APP_BACKUP_PAYLOAD_VERSION,
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
