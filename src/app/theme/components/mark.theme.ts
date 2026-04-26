import type { MantineThemeComponents } from '@mantine/core';

export const markTheme: MantineThemeComponents['Mark'] = {
  defaultProps: {
    color: 'warning',
  },
  styles: {
    root: {
      borderRadius: '0.25rem',
      color: 'var(--sl-text)',
      paddingInline: '0.2em',
    },
  },
};
