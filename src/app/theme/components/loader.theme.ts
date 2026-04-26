import type { MantineThemeComponents } from '@mantine/core';

export const loaderTheme: MantineThemeComponents['Loader'] = {
  defaultProps: {
    color: 'brand',
    size: 'md',
    type: 'dots',
  },
};
