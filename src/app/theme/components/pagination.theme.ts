import type { MantineThemeComponents } from '@mantine/core';

import classes from '@/app/theme/components/pagination.theme.module.css';
import { controlTransition } from '@/app/theme/components/shared';

export const paginationTheme: MantineThemeComponents['Pagination'] = {
  defaultProps: {
    color: 'brand',
    radius: 'md',
    size: 'sm',
    withControls: true,
    withEdges: true,
  },
  classNames: {
    control: classes.control,
  },
  styles: {
    control: {
      boxShadow: 'var(--sl-control-shadow)',
      transition: controlTransition,
    },
    dots: {
      color: 'var(--sl-muted-text)',
      transition: controlTransition,
    },
  },
};
