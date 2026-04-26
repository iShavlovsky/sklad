import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  type DragEndEvent,
  type DragStartEvent,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { arrayMove, sortableKeyboardCoordinates } from '@dnd-kit/sortable';

import {
  type HomeFavoriteItem,
  useHomeFavorites,
  useSaveHomeFavoritesOrder,
} from '@/features/dashboard/model/use-home-favorites.ts';
import { useHapticSignal } from '@/shared/haptics';

const HOME_FAVORITES_SAVE_DEBOUNCE_MS = 280;

function buildFavoritesOrderKey(items: readonly HomeFavoriteItem[]): string {
  return items.map((favorite) => `${favorite.id}:${favorite.order}`).join('|');
}

function reorderFavorites(
  items: readonly HomeFavoriteItem[],
  activeId: string,
  overId: string
): HomeFavoriteItem[] | null {
  const oldIndex = items.findIndex((favorite) => favorite.id === activeId);
  const newIndex = items.findIndex((favorite) => favorite.id === overId);

  if (oldIndex < 0 || newIndex < 0) {
    return null;
  }

  return arrayMove([...items], oldIndex, newIndex).map((favorite, order) => ({
    ...favorite,
    order,
  }));
}

export function useHomeFavoritesReorder(): {
  favoriteIds: string[];
  favorites: HomeFavoriteItem[];
  handleDragEnd: (event: DragEndEvent) => void;
  handleDragStart: (event: DragStartEvent) => void;
  handleReorderHold: (favoriteId: string) => void;
  sensors: ReturnType<typeof useSensors>;
} {
  const favorites = useHomeFavorites();
  const saveOrder = useSaveHomeFavoritesOrder();
  const [orderedFavorites, setOrderedFavorites] =
    useState<HomeFavoriteItem[]>(favorites);
  const [isPersisting, setIsPersisting] = useState(false);
  const [dragSignal, setDragSignal] = useState<string | null>(null);
  const [dropSignal, setDropSignal] = useState<string | null>(null);
  const persistExpectedOrderKeyRef = useRef<string | null>(null);
  const persistDebounceTimerRef = useRef<number | null>(null);
  const pendingPersistFavoritesRef = useRef<HomeFavoriteItem[] | null>(null);

  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: 6,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 160,
        tolerance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );
  const favoriteIds = useMemo(
    () => orderedFavorites.map((favorite) => favorite.id),
    [orderedFavorites]
  );
  const favoritesOrderKey = useMemo(
    () => buildFavoritesOrderKey(favorites),
    [favorites]
  );
  const pendingPersistedOrderKey = useMemo(
    () => buildFavoritesOrderKey(orderedFavorites),
    [orderedFavorites]
  );

  useHapticSignal({
    pattern: 'tap',
    signal: dragSignal,
  });
  useHapticSignal({
    pattern: 'selection',
    signal: dropSignal,
  });

  useEffect(() => {
    if (isPersisting || persistDebounceTimerRef.current !== null) {
      return;
    }

    if (persistExpectedOrderKeyRef.current !== null) {
      if (favoritesOrderKey !== persistExpectedOrderKeyRef.current) {
        return;
      }

      persistExpectedOrderKeyRef.current = null;
    }

    if (favoritesOrderKey === pendingPersistedOrderKey) {
      return;
    }

    queueMicrotask(() => {
      setOrderedFavorites(favorites);
    });
  }, [favorites, favoritesOrderKey, isPersisting, pendingPersistedOrderKey]);

  useEffect(
    () => () => {
      if (persistDebounceTimerRef.current !== null) {
        window.clearTimeout(persistDebounceTimerRef.current);
      }
    },
    []
  );

  const handleDragStart = useCallback((event: DragStartEvent) => {
    setDragSignal(String(event.active.id));
  }, []);

  const handleReorderHold = useCallback((favoriteId: string) => {
    setDragSignal(`hold:${favoriteId}:${Date.now()}`);
  }, []);

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;

      if (!over || active.id === over.id) {
        return;
      }

      const nextFavorites = reorderFavorites(
        orderedFavorites,
        String(active.id),
        String(over.id)
      );

      if (nextFavorites === null) {
        return;
      }

      const nextOrderKey = buildFavoritesOrderKey(nextFavorites);
      setOrderedFavorites(nextFavorites);
      pendingPersistFavoritesRef.current = nextFavorites;

      if (persistDebounceTimerRef.current !== null) {
        window.clearTimeout(persistDebounceTimerRef.current);
      }

      persistDebounceTimerRef.current = window.setTimeout(() => {
        const favoritesToPersist = pendingPersistFavoritesRef.current;
        persistDebounceTimerRef.current = null;

        if (favoritesToPersist === null) {
          return;
        }

        pendingPersistFavoritesRef.current = null;
        persistExpectedOrderKeyRef.current = nextOrderKey;
        setIsPersisting(true);

        void saveOrder(favoritesToPersist)
          .then((result) => {
            if (!result.ok) {
              persistExpectedOrderKeyRef.current = null;
              setOrderedFavorites(favorites);
              return result;
            }

            setDropSignal(
              `${String(active.id)}:${String(over.id)}:${Date.now()}`
            );
            return result;
          })
          .finally(() => {
            setIsPersisting(false);
          });
      }, HOME_FAVORITES_SAVE_DEBOUNCE_MS);
    },
    [favorites, orderedFavorites, saveOrder]
  );

  return {
    favoriteIds,
    favorites: orderedFavorites,
    handleDragEnd,
    handleDragStart,
    handleReorderHold,
    sensors,
  };
}
