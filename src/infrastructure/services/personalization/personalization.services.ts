import type {
  DeleteFavoriteInput,
  DeleteFavoriteResult,
  DeleteProfileInput,
  DeleteProfileResult,
  DeleteSettingInput,
  DeleteSettingResult,
  SaveFavoriteInput,
  SaveFavoriteResult,
  SaveProfileInput,
  SaveProfileResult,
  SaveSettingInput,
  SaveSettingResult,
} from '@/domain/settings';
import {
  DeleteFavoriteService,
  DeleteProfileService,
  DeleteSettingService,
  SaveFavoriteService,
  SaveProfileService,
  SaveSettingService,
} from '@/domain/settings';
import { appDb } from '@/infrastructure/db';
import { FavoriteRepository } from '@/infrastructure/repositories/personalization/favorite.repository';
import { ProfileRepository } from '@/infrastructure/repositories/personalization/profile.repository';
import { SettingsRepository } from '@/infrastructure/repositories/personalization/settings.repository';

const settingsRepository = new SettingsRepository(appDb.settings);
const favoriteRepository = new FavoriteRepository(appDb.favorites);
const profileRepository = new ProfileRepository(appDb.profiles);
const saveSettingServiceImpl = new SaveSettingService();
const deleteSettingServiceImpl = new DeleteSettingService();
const saveFavoriteServiceImpl = new SaveFavoriteService();
const deleteFavoriteServiceImpl = new DeleteFavoriteService();
const saveProfileServiceImpl = new SaveProfileService();
const deleteProfileServiceImpl = new DeleteProfileService();

/**
 * Thin UI-facing facade for durable setting writes.
 */
export interface SaveSettingServiceFacade {
  execute(input: SaveSettingInput): Promise<SaveSettingResult>;
}

/**
 * Durable setting write handle for first-data UI hooks.
 */
export const saveSettingService: SaveSettingServiceFacade = {
  execute(input: SaveSettingInput): Promise<SaveSettingResult> {
    return saveSettingServiceImpl.execute(input, settingsRepository);
  },
};

/**
 * Thin UI-facing facade for durable setting deletes.
 */
export interface DeleteSettingServiceFacade {
  execute(input: DeleteSettingInput): Promise<DeleteSettingResult>;
}

/**
 * Durable setting delete handle for first-data UI hooks.
 */
export const deleteSettingService: DeleteSettingServiceFacade = {
  execute(input: DeleteSettingInput): Promise<DeleteSettingResult> {
    return deleteSettingServiceImpl.execute(input, settingsRepository);
  },
};

/**
 * Thin UI-facing facade for favorite writes.
 */
export interface SaveFavoriteServiceFacade {
  execute(input: SaveFavoriteInput): Promise<SaveFavoriteResult>;
}

/**
 * Durable favorite write handle for first-data UI hooks.
 */
export const saveFavoriteService: SaveFavoriteServiceFacade = {
  execute(input: SaveFavoriteInput): Promise<SaveFavoriteResult> {
    return saveFavoriteServiceImpl.execute(input, favoriteRepository);
  },
};

/**
 * Thin UI-facing facade for favorite deletes.
 */
export interface DeleteFavoriteServiceFacade {
  execute(input: DeleteFavoriteInput): Promise<DeleteFavoriteResult>;
}

/**
 * Durable favorite delete handle for first-data UI hooks.
 */
export const deleteFavoriteService: DeleteFavoriteServiceFacade = {
  execute(input: DeleteFavoriteInput): Promise<DeleteFavoriteResult> {
    return deleteFavoriteServiceImpl.execute(input, favoriteRepository);
  },
};

/**
 * Thin UI-facing facade for profile writes.
 */
export interface SaveProfileServiceFacade {
  execute(input: SaveProfileInput): Promise<SaveProfileResult>;
}

/**
 * Durable profile write handle for first-data UI hooks.
 */
export const saveProfileService: SaveProfileServiceFacade = {
  execute(input: SaveProfileInput): Promise<SaveProfileResult> {
    return saveProfileServiceImpl.execute(input, profileRepository);
  },
};

/**
 * Thin UI-facing facade for profile deletes.
 */
export interface DeleteProfileServiceFacade {
  execute(input: DeleteProfileInput): Promise<DeleteProfileResult>;
}

/**
 * Durable profile delete handle for first-data UI hooks.
 */
export const deleteProfileService: DeleteProfileServiceFacade = {
  execute(input: DeleteProfileInput): Promise<DeleteProfileResult> {
    return deleteProfileServiceImpl.execute(input, profileRepository);
  },
};
