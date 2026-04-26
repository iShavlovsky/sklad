import type { MantineThemeComponents } from '@mantine/core';

import { controlTransition } from '@/app/theme/components/shared';
import classes from '@/app/theme/components/stepper.theme.module.css';

export const stepperTheme: MantineThemeComponents['Stepper'] = {
  defaultProps: {
    color: 'brand',
    contentPadding: 'md',
    radius: 'xl',
    size: 'sm',
  },
  classNames: {
    stepIcon: classes.stepIcon,
  },
  styles: {
    stepIcon: {
      boxShadow: 'var(--sl-control-shadow)',
      transition: controlTransition,
    },
    stepLabel: {
      color: 'var(--sl-text)',
      fontWeight: 700,
      transition: controlTransition,
    },
    stepDescription: {
      color: 'var(--sl-muted-text)',
      transition: controlTransition,
    },
    separator: {
      transition: controlTransition,
    },
  },
};
