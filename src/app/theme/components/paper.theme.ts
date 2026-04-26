import type { MantineThemeComponents } from '@mantine/core';

import classes from '@/app/theme/components/interactive-surface.theme.module.css';
import {
  controlTransition,
  elevatedSurfaceStyles,
} from '@/app/theme/components/shared';

export const paperTheme: MantineThemeComponents['Paper'] = {
  defaultProps: {
    radius: 'md',
    withBorder: true,
  },
  classNames: {
    root: classes.root,
  },
  styles: {
    root: {
      ...elevatedSurfaceStyles,
      transition: controlTransition,
    },
  },
};
