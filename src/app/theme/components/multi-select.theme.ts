import type { MantineThemeComponents } from '@mantine/core';

import {
  comboboxDropdownStyles,
  comboboxOptionStyles,
  controlDescriptionStyles,
  controlErrorStyles,
  controlLabelStyles,
  filledInputStyles,
} from '@/app/theme/components/shared';
import classes from '@/app/theme/components/shared-input.theme.module.css';

export const multiSelectTheme: MantineThemeComponents['MultiSelect'] = {
  defaultProps: {
    radius: 'md',
    size: 'md',
    variant: 'filled',
  },
  classNames: {
    input: classes.input,
    option: classes.comboboxOption,
  },
  styles: {
    dropdown: comboboxDropdownStyles,
    input: filledInputStyles,
    option: comboboxOptionStyles,
    pill: {
      background: 'var(--sl-accent-soft)',
      color: 'var(--sl-nav-active-text)',
    },
    label: controlLabelStyles,
    description: controlDescriptionStyles,
    error: controlErrorStyles,
  },
};
