import type { MantineThemeComponents } from '@mantine/core';

export const navLinkTheme: MantineThemeComponents['NavLink'] = {
  defaultProps: {
    radius: 'md',
    color: 'brand',
    p: 'xs',
  },
  styles: {
    root: {
      color: 'var(--sl-text)',
    },
    section: {
      color: 'var(--sl-muted-text)',
    },
  },
};
