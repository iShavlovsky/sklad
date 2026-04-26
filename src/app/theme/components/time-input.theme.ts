import type { MantineThemeComponents } from '@mantine/core';

import {
  controlDescriptionStyles,
  controlErrorStyles,
  controlLabelStyles,
  filledInputStyles,
} from '@/app/theme/components/shared';
import classes from '@/app/theme/components/shared-input.theme.module.css';

export const timeInputTheme: MantineThemeComponents['TimeInput'] = {
  defaultProps: {
    radius: 'md',
    size: 'md',
    variant: 'filled',
  },
  classNames: {
    input: classes.input,
  },
  styles: {
    input: filledInputStyles,
    label: controlLabelStyles,
    description: controlDescriptionStyles,
    error: controlErrorStyles,
  },
};
