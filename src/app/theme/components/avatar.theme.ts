import type { MantineThemeComponents } from '@mantine/core';

export const avatarTheme: MantineThemeComponents['Avatar'] = {
  defaultProps: {
    color: 'brand',
    radius: 'xl',
    variant: 'light',
  },
  styles: {
    placeholder: {
      fontWeight: 700,
    },
  },
};
