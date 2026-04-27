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
      gap: '0.125rem',
      minWidth: 0,
    },
    wrapper: {
      alignItems: 'center',
      gap: 'var(--mantine-spacing-sm)',
    },
    icon: {
      alignSelf: 'center',
      alignItems: 'center',
      backgroundColor:
        'color-mix(in srgb, var(--alert-color) 14%, transparent)',
      borderRadius: 'var(--sl-control-radius)',
      color: 'var(--alert-color)',
      display: 'grid',
      flex: '0 0 2rem',
      width: '2rem',
      height: '2rem',
      lineHeight: 0,
      margin: 0,
      placeItems: 'center',
      justifyContent: 'center',
      '& > svg': {
        display: 'block',
        flex: '0 0 auto',
        margin: 0,
        width: '1rem',
        height: '1rem',
      },
    },
    closeButton: {
      color: 'var(--alert-color)',
      transition: controlTransition,
    },
  },
};
