import type { MantineThemeComponents } from '@mantine/core';

import {
  comboboxDropdownStyles,
  controlDescriptionStyles,
  controlErrorStyles,
  controlLabelStyles,
  controlTransition,
  filledInputStyles,
} from '@/app/theme/components/shared';
import classes from '@/app/theme/components/shared-input.theme.module.css';

export const datePickerInputTheme: MantineThemeComponents['DatePickerInput'] = {
  defaultProps: {
    radius: 'md',
    size: 'md',
    variant: 'filled',
  },
  classNames: {
    input: classes.input,
  },
  styles: {
    dropdown: comboboxDropdownStyles,
    input: filledInputStyles,
    label: controlLabelStyles,
    description: controlDescriptionStyles,
    error: controlErrorStyles,
    placeholder: {
      color: 'var(--sl-muted-text)',
    },
    day: {
      transition: controlTransition,
    },
  },
};
