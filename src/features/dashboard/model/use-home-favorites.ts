import { useCallback, useEffect, useMemo, useRef } from 'react';

import { useFavoriteList } from '@/features/settings/hooks/use-favorite-list.ts';
import { useSaveFavorite } from '@/features/settings/hooks/use-save-favorite.ts';
import { useSaveSetting } from '@/features/settings/hooks/use-save-setting.ts';
import { useSettingDetails } from '@/features/settings/hooks/use-setting-details.ts';
import { APP_ROUTES } from '@/shared/config/routes.ts';

const HOME_FAVORITES_SEEDED_KEY = 'ui.home.favorites.seeded';
export const HOME_FAVORITE_SCANNER_TARGET = 'action:scanner';

export type HomeFavoriteIconKey =
  | 'scanner'
  | 'buffer'
  | 'arrival-create'
  | 'departure-create'
  | 'drafts'
  | 'settings';

export interface HomeFavoriteItem {
  id: string;
  icon: HomeFavoriteIconKey;
  label: string;
  target: string;
  kind: 'action' | 'route';
  order: number;
}

const HOME_FAVORITES_STARTER_SET = [
  {
    id: 'favorite-home-scanner',
    label: 'Сканер',
    route: HOME_FAVORITE_SCANNER_TARGET,
    icon: 'scanner',
    order: 0,
  },
  {
    id: 'favorite-home-buffer',
    label: 'Буфер',
    route: APP_ROUTES.buffer,
    icon: 'buffer',
    order: 1,
  },
  {
    id: 'favorite-home-arrival-create',
    label: 'Новый приход',
    route: APP_ROUTES.arrivalsCreate,
    icon: 'arrival-create',
    order: 2,
  },
  {
    id: 'favorite-home-departure-create',
    label: 'Новая отгрузка',
    route: APP_ROUTES.departuresCreate,
    icon: 'departure-create',
    order: 3,
  },
  {
    id: 'favorite-home-drafts',
    label: 'Черновики',
    route: APP_ROUTES.drafts,
    icon: 'drafts',
    order: 4,
  },
  {
    id: 'favorite-home-settings',
    label: 'Настройки',
    route: APP_ROUTES.settings,
    icon: 'settings',
    order: 5,
  },
] as const;

function toHomeFavoriteItem(input: {
  id: string;
  icon: string | null;
  label: string;
  route: string;
  order: number;
}): HomeFavoriteItem {
  return {
    id: input.id,
    icon: (input.icon ?? 'buffer') as HomeFavoriteIconKey,
    label: input.label,
    target: input.route,
    kind: input.route === HOME_FAVORITE_SCANNER_TARGET ? 'action' : 'route',
    order: input.order,
  };
}

export function useHomeFavorites(): HomeFavoriteItem[] {
  const favorites = useFavoriteList();
  const favoriteSeedSetting = useSettingDetails(HOME_FAVORITES_SEEDED_KEY);
  const saveFavorite = useSaveFavorite();
  const saveSetting = useSaveSetting();
  const isSeedingRef = useRef(false);

  useEffect(() => {
    if (favoriteSeedSetting === undefined || isSeedingRef.current) return;

    const alreadySeeded =
      favoriteSeedSetting?.setting?.value === true ||
      favoriteSeedSetting?.setting?.value === 'true';

    if (alreadySeeded) return;
    isSeedingRef.current = true;

    void (async () => {
      try {
        let seedSucceeded = favorites.length > 0;

        if (favorites.length === 0) {
          seedSucceeded = true;
          for (const favorite of HOME_FAVORITES_STARTER_SET) {
            const result = await saveFavorite.execute(favorite);
            if (!result.ok) {
              seedSucceeded = false;
            }
          }
        }

        if (seedSucceeded) {
          await saveSetting.execute({
            key: HOME_FAVORITES_SEEDED_KEY,
            value: true,
          });
        }
      } finally {
        isSeedingRef.current = false;
      }
    })();
  }, [favoriteSeedSetting, favorites.length, saveFavorite, saveSetting]);

  return useMemo(() => {
    if (favorites.length > 0) return favorites.map(toHomeFavoriteItem);
    return HOME_FAVORITES_STARTER_SET.map(toHomeFavoriteItem);
  }, [favorites]);
}

export interface SaveHomeFavoritesOrderResult {
  ok: boolean;
  failedIds: string[];
}

export function useSaveHomeFavoritesOrder(): (
  items: HomeFavoriteItem[]
) => Promise<SaveHomeFavoritesOrderResult> {
  const saveFavorite = useSaveFavorite();

  return useCallback(
    async (
      items: HomeFavoriteItem[]
    ): Promise<SaveHomeFavoritesOrderResult> => {
      const failedIds: string[] = [];

      for (const [order, item] of items.entries()) {
        const result = await saveFavorite.execute({
          id: item.id,
          label: item.label,
          route: item.target,
          icon: item.icon,
          order,
        });

        if (!result.ok) {
          failedIds.push(item.id);
        }
      }

      return {
        ok: failedIds.length === 0,
        failedIds,
      };
    },
    [saveFavorite]
  );
}
