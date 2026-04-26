import type { MantineThemeComponents } from '@mantine/core';

export const skeletonTheme: MantineThemeComponents['Skeleton'] = {
  defaultProps: {
    radius: 'md',
    animate: true,
  },
  styles: {
    root: {
      backgroundColor:
        'color-mix(in srgb, var(--sl-surface-subtle) 92%, var(--sl-shell-border))',
    },
  },
};
