import type { MantineThemeComponents } from '@mantine/core';

import {
  controlTransition,
  elevatedSurfaceStyles,
} from '@/app/theme/components/shared';

export const alertTheme: MantineThemeComponents['Alert'] = {
  defaultProps: {
    radius: 'md',
    variant: 'light',
    withCloseButton: false,
  },
  styles: {
    root: {
      ...elevatedSurfaceStyles,
      backgroundColor: 'var(--alert-bg)',
      border: '1px solid var(--alert-bd)',
      transition: controlTransition,
    },
    title: {
      color: 'var(--sl-text)',
      fontSize: 'var(--mantine-font-size-sm)',
      fontWeight: 700,
    },
    label: {
      color: 'inherit',
      fontSize: 'inherit',
      fontWeight: 'inherit',
    },
    message: {
      color: 'var(--sl-muted-text)',
      fontSize: 'var(--mantine-font-size-sm)',
    },
    body: {
      color: 'var(--sl-text)',
    },
    icon: {
      alignSelf: 'flex-start',
      backgroundColor:
        'color-mix(in srgb, var(--alert-color) 14%, transparent)',
      borderRadius: 'var(--sl-control-radius)',
      color: 'var(--alert-color)',
      display: 'grid',
      minHeight: '2rem',
      minWidth: '2rem',
      placeItems: 'center',
      '& > svg': {
        display: 'block',
      },
    },
    closeButton: {
      color: 'var(--alert-color)',
      transition: controlTransition,
    },
  },
};
