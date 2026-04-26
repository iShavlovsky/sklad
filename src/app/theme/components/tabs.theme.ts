import type { MantineThemeComponents } from '@mantine/core';

import classes from '@/app/theme/components/tabs.theme.module.css';

export const tabsTheme: MantineThemeComponents['Tabs'] = {
  defaultProps: {
    radius: 'md',
    variant: 'outline',
  },
  classNames: {
    tab: classes.tab,
  },
  styles: {
    root: {
      '--tabs-radius': 'var(--sl-control-radius)',
    },
    list: {
      alignItems: 'stretch',
      gap: 'var(--mantine-spacing-xs)',
      marginBottom: 'var(--mantine-spacing-xs)',
    },
    tab: {
      backgroundColor: 'var(--sl-surface-subtle)',
      border: '1px solid var(--sl-shell-border)',
      borderBottomLeftRadius: 0,
      borderBottomRightRadius: 0,
      borderTopLeftRadius: 'var(--sl-control-radius)',
      borderTopRightRadius: 'var(--sl-control-radius)',
      color: 'var(--sl-control-text)',
      fontWeight: 700,
      transition:
        'background-color var(--duration-fast) var(--ease-standard), border-color var(--duration-fast) var(--ease-standard), color var(--duration-fast) var(--ease-standard), box-shadow var(--duration-fast) var(--ease-standard)',
    },
    tabSection: {
      color: 'inherit',
    },
    tabLabel: {
      color: 'inherit',
    },
    panel: {
      borderTopColor: 'var(--sl-shell-border)',
    },
  },
};
