import type { MantineThemeComponents } from '@mantine/core';

import classes from '@/app/theme/components/menu.theme.module.css';
import { controlTransition } from '@/app/theme/components/shared';

export const menuTheme: MantineThemeComponents['Menu'] = {
  defaultProps: {
    shadow: 'md',
    transitionProps: {
      transition: 'rotate-right',
      duration: 160,
      timingFunction: 'var(--ease-standard)',
    },
    withArrow: true,
  },
  classNames: {
    item: classes.item,
  },
  styles: {
    dropdown: {
      backgroundColor: 'var(--sl-surface-card)',
      borderColor: 'var(--sl-shell-border)',
      boxShadow: 'var(--sl-panel-shadow)',
    },
    item: {
      borderRadius: 'var(--sl-control-radius)',
      color: 'var(--sl-text)',
      fontSize: 'var(--mantine-font-size-sm)',
      fontWeight: 600,
      transition: controlTransition,
    },
    label: {
      color: 'var(--sl-muted-text)',
      fontSize: 'var(--mantine-font-size-xs)',
      fontWeight: 700,
      transition: controlTransition,
    },
  },
};
