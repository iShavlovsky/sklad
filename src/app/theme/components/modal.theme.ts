import type { MantineThemeComponents } from '@mantine/core';

import { controlTransition } from '@/app/theme/components/shared';

export const modalTheme: MantineThemeComponents['Modal'] = {
  defaultProps: {
    centered: true,
    overlayProps: {
      backgroundOpacity: 0.22,
      blur: 4,
    },
    radius: 'lg',
    shadow: 'xl',
    transitionProps: {
      transition: 'pop',
      duration: 180,
      timingFunction: 'var(--ease-standard)',
    },
  },
  styles: {
    content: {
      backgroundColor: 'var(--sl-surface-card)',
      border: '1px solid var(--sl-shell-border)',
      borderColor: 'var(--sl-shell-border)',
      boxShadow: 'var(--sl-shell-shadow)',
      transition: controlTransition,
    },
    header: {
      backgroundColor: 'transparent',
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
