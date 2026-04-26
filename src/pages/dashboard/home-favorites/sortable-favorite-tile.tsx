import type { ReactElement } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  Box,
  Paper,
  Stack,
  Text,
  ThemeIcon,
  UnstyledButton,
} from '@mantine/core';
import {
  IconArrowDown,
  IconArrowUp,
  IconGripVertical,
  IconListCheck,
  IconNotes,
  IconQrcode,
  IconSettings,
} from '@tabler/icons-react';

import type {
  HomeFavoriteIconKey,
  HomeFavoriteItem,
} from '@/features/dashboard/model/use-home-favorites.ts';
import { usePressAndHoldGesture } from '@/shared/gestures';
import type { EntityIconTone } from '@/shared/ui/entity-icon-tones';
import { getEntityIconToneStyle } from '@/shared/ui/entity-icon-tones';

import styles from './styles.module.css';

const favoriteIconMap: Record<HomeFavoriteIconKey, typeof IconQrcode> = {
  scanner: IconQrcode,
  buffer: IconListCheck,
  'arrival-create': IconArrowDown,
  'departure-create': IconArrowUp,
  drafts: IconNotes,
  settings: IconSettings,
};

const favoriteToneMap: Record<HomeFavoriteIconKey, EntityIconTone> = {
  'arrival-create': 'arrival',
  buffer: 'buffer',
  'departure-create': 'departure',
  drafts: 'drafts',
  scanner: 'scanner',
  settings: 'settings',
};

interface SortableFavoriteTileProps {
  favorite: HomeFavoriteItem;
  isReorderEnabled: boolean;
  onOpen: (favorite: HomeFavoriteItem) => void;
  onReorderHold: () => void;
}

export function SortableFavoriteTile({
  favorite,
  isReorderEnabled,
  onOpen,
  onReorderHold,
}: Readonly<SortableFavoriteTileProps>): ReactElement {
  const Icon = favoriteIconMap[favorite.icon];
  const iconToneStyle = getEntityIconToneStyle(favoriteToneMap[favorite.icon]);
  const {
    attributes,
    listeners,
    setActivatorNodeRef,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    disabled: !isReorderEnabled,
    id: favorite.id,
  });
  const holdGesture = usePressAndHoldGesture({
    enabled: isReorderEnabled,
    onHold: onReorderHold,
  });

  return (
    <Paper
      ref={setNodeRef}
      className={`${styles.tile} home-favorite-tile`}
      data-dragging={isDragging || undefined}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
      }}
    >
      <Paper
        className={`${styles.tileSurface} home-favorite-tile__surface`}
        data-interactive="true"
        p="xs"
        radius="md"
      >
        <UnstyledButton
          aria-label={favorite.label}
          className={styles.tileButton}
          data-testid={`home-favorite-${favorite.id}`}
          onClick={() => onOpen(favorite)}
          type="button"
        >
          <Stack
            align="center"
            className={styles.tileContent}
            gap={5}
            justify="center"
          >
            <ThemeIcon
              className={styles.tileIcon}
              radius="xl"
              size="lg"
              style={iconToneStyle}
              variant="light"
            >
              <Icon size={18} stroke={1.8} />
            </ThemeIcon>
            <Text
              className={`${styles.tileLabel} home-favorite-tile__label`}
              fw={700}
              size="xs"
              ta="center"
            >
              {favorite.label}
            </Text>
          </Stack>
        </UnstyledButton>

        <Box
          {...attributes}
          {...holdGesture.bind}
          aria-label={`Переместить ${favorite.label}`}
          className={styles.dragHandle}
          component="div"
          data-locked={!isReorderEnabled || undefined}
          ref={setActivatorNodeRef}
          {...listeners}
        >
          <IconGripVertical size={24} stroke={2} />
        </Box>
      </Paper>
    </Paper>
  );
}
