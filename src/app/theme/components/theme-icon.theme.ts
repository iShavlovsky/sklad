import type { MantineThemeComponents } from '@mantine/core';

import classes from '@/app/theme/components/theme-icon.theme.module.css';

export const themeIconTheme: MantineThemeComponents['ThemeIcon'] = {
  defaultProps: {
    radius: 'xl',
  },
  classNames: {
    root: classes.root,
  },
  styles: {
    root: {},
  },
};
