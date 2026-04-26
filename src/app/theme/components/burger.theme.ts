import type { MantineThemeComponents } from '@mantine/core';

import classes from '@/app/theme/components/burger.theme.module.css';
import { controlTransition } from '@/app/theme/components/shared';

export const burgerTheme: MantineThemeComponents['Burger'] = {
  defaultProps: {
    color: 'brand',
    size: 'sm',
    transitionDuration: 180,
    transitionTimingFunction: 'var(--ease-standard)',
  },
  classNames: {
    root: classes.root,
  },
  styles: {
    root: {
      borderRadius: 'var(--sl-control-radius)',
      boxShadow: 'var(--sl-control-shadow)',
      transition: controlTransition,
    },
    burger: {
      color: 'var(--burger-color)',
    },
  },
};
