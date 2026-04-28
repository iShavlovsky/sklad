import { createBackupCheckpointService } from '@/infrastructure/services/backup/backup-checkpoint.services.ts';
import { createBackupExportService } from '@/infrastructure/services/backup/backup-export.services.ts';
import { createBackupImportValidationService } from '@/infrastructure/services/backup/backup-import-validation.services.ts';
import { createBackupRestoreService } from '@/infrastructure/services/backup/backup-restore.services.ts';
import { createArrivalComposition } from '@/infrastructure/services/journals/arrival.services.ts';
import { createDepartureComposition } from '@/infrastructure/services/journals/departure.services.ts';
import { createDraftComposition } from '@/infrastructure/services/journals/draft.services.ts';

export { updateProductService } from './directories/product.services.ts';
export {
  deleteFavoriteService,
  deleteProfileService,
  deleteSettingService,
  saveFavoriteService,
  saveProfileService,
  saveSettingService,
} from './personalization/personalization.services.ts';

const arrivalComposition = createArrivalComposition();
const backupCheckpointService = createBackupCheckpointService();
const backupExportService = createBackupExportService();
const backupImportValidationService = createBackupImportValidationService();
const backupRestoreService = createBackupRestoreService();
const departureComposition = createDepartureComposition();

const {
  createArrivalDependencies,
  createArrivalService,
  deleteArrivalService,
  updateArrivalService,
} = arrivalComposition;

const {
  createDepartureDependencies,
  createDepartureService,
  deleteDepartureService,
  updateDepartureService,
} = departureComposition;

const draftComposition = createDraftComposition({
  arrivalCreateDependencies: createArrivalDependencies,
  departureCreateDependencies: createDepartureDependencies,
});

const {
  createDraftService,
  deleteDraftService,
  updateDraftService,
  publishDraftService,
} = draftComposition;

export {
  backupCheckpointService,
  backupExportService,
  backupImportValidationService,
  backupRestoreService,
  createArrivalService,
  createDepartureService,
  createDraftService,
  deleteArrivalService,
  deleteDepartureService,
  deleteDraftService,
  publishDraftService,
  updateArrivalService,
  updateDepartureService,
  updateDraftService,
};
