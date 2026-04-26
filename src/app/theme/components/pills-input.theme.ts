import type { MantineThemeComponents } from '@mantine/core';

import {
  comboboxDropdownStyles,
  controlDescriptionStyles,
  controlErrorStyles,
  controlLabelStyles,
  filledInputStyles,
  inputSectionStyles,
} from '@/app/theme/components/shared';
import classes from '@/app/theme/components/shared-input.theme.module.css';

export const pillsInputTheme: MantineThemeComponents['PillsInput'] = {
  defaultProps: {
    radius: 'md',
    size: 'md',
    variant: 'filled',
  },
  classNames: {
    input: classes.input,
    section: classes.inputSection,
  },
  styles: {
    dropdown: comboboxDropdownStyles,
    field: {
      color: 'var(--sl-control-text)',
      fontSize: 'inherit',
      minHeight: 'calc(var(--input-height) - 0.5rem)',
    },
    input: {
      ...filledInputStyles,
      alignItems: 'flex-start',
      gap: '0.375rem',
      paddingBlock: '0.375rem',
    },
    label: controlLabelStyles,
    description: controlDescriptionStyles,
    error: controlErrorStyles,
    section: inputSectionStyles,
  },
};
