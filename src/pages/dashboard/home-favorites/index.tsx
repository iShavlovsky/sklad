import type { ReactElement } from 'react';
import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { closestCenter, DndContext } from '@dnd-kit/core';
import { rectSortingStrategy, SortableContext } from '@dnd-kit/sortable';
import { Box } from '@mantine/core';

import {
  HOME_FAVORITE_SCANNER_TARGET,
  type HomeFavoriteItem,
} from '@/features/dashboard/model/use-home-favorites.ts';
import { getPreferredScannerTab } from '@/features/scanner-runtime/model/scanner-preferences.store.ts';
import { browserScannerRuntimeController } from '@/infrastructure/browser/scanner/runtime/controller.instance.ts';

import { useHomeFavoritesReorder } from './hooks/use-home-favorites-reorder';
import { SortableFavoriteTile } from './sortable-favorite-tile';

import styles from './styles.module.css';

interface HomeFavoritesProps {
  isReorderEnabled: boolean;
}

export function HomeFavorites({
  isReorderEnabled,
}: Readonly<HomeFavoritesProps>): ReactElement {
  const navigate = useNavigate();
  const {
    favoriteIds,
    favorites,
    handleDragEnd,
    handleDragStart,
    handleReorderHold,
    sensors,
  } = useHomeFavoritesReorder();

  const handleOpen = useCallback(
    (favorite: HomeFavoriteItem) => {
      if (favorite.target === HOME_FAVORITE_SCANNER_TARGET) {
        browserScannerRuntimeController.openSession({
          activeTab: getPreferredScannerTab(),
          entrypoint: 'global',
        });
        return;
      }

      navigate(favorite.target);
    },
    [navigate]
  );

  return (
    <DndContext
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
      onDragStart={handleDragStart}
      sensors={sensors}
    >
      <SortableContext items={favoriteIds} strategy={rectSortingStrategy}>
        <Box className={`${styles.grid} home-favorites-grid`}>
          {favorites.map((favorite) => (
            <SortableFavoriteTile
              favorite={favorite}
              isReorderEnabled={isReorderEnabled}
              key={favorite.id}
              onOpen={handleOpen}
              onReorderHold={() => {
                handleReorderHold(favorite.id);
              }}
            />
          ))}
        </Box>
      </SortableContext>
    </DndContext>
  );
}
