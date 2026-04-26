import type { MantineThemeComponents } from '@mantine/core';

import {
  controlTransition,
  elevatedSurfaceStyles,
} from '@/app/theme/components/shared';

export const notificationTheme: MantineThemeComponents['Notification'] = {
  defaultProps: {
    radius: 'md',
    withBorder: true,
    withCloseButton: true,
  },
  styles: {
    root: {
      ...elevatedSurfaceStyles,
      backgroundColor:
        'color-mix(in srgb, var(--notification-color) 11%, var(--sl-surface-card))',
      border:
        '1px solid color-mix(in srgb, var(--notification-color) 34%, var(--sl-shell-border))',
      transition: controlTransition,
    },
    title: {
      color: 'var(--sl-text)',
      fontSize: 'var(--mantine-font-size-sm)',
      fontWeight: 700,
    },
    description: {
      color: 'var(--sl-muted-text)',
      fontSize: 'var(--mantine-font-size-sm)',
    },
    icon: {
      alignSelf: 'flex-start',
      backgroundColor:
        'color-mix(in srgb, var(--notification-color) 14%, transparent)',
      borderRadius: 'var(--sl-control-radius)',
      color: 'var(--notification-color)',
      display: 'grid',
      minHeight: '2rem',
      minWidth: '2rem',
      placeItems: 'center',
      '& > svg': {
        display: 'block',
      },
    },
    loader: {
      color: 'var(--notification-color)',
    },
    closeButton: {
      color: 'var(--notification-color)',
      transition: controlTransition,
    },
  },
};
