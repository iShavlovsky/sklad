import type { MantineThemeComponents } from '@mantine/core';

import {
  controlTransition,
  elevatedSurfaceStyles,
} from '@/app/theme/components/shared';

export const drawerTheme: MantineThemeComponents['Drawer'] = {
  defaultProps: {
    radius: 'lg',
    shadow: 'xl',
    transitionProps: {
      transition: 'slide-left',
      duration: 180,
      timingFunction: 'var(--ease-standard)',
    },
    withCloseButton: true,
  },
  styles: {
    content: {
      ...elevatedSurfaceStyles,
      transition: controlTransition,
    },
    header: {
      background: 'transparent',
      borderBottom: '1px solid var(--sl-surface-glass-border)',
    },
    title: {
      color: 'var(--sl-text)',
      fontSize: 'var(--mantine-font-size-md)',
      fontWeight: 700,
    },
    body: {
      color: 'var(--sl-text)',
    },
  },
};
