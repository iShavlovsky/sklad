import type { MantineThemeComponents } from '@mantine/core';

import {
  comboboxDropdownStyles,
  comboboxOptionStyles,
  controlDescriptionStyles,
  controlErrorStyles,
  controlLabelStyles,
  filledInputStyles,
  inputSectionStyles,
} from '@/app/theme/components/shared';
import classes from '@/app/theme/components/shared-input.theme.module.css';

export const tagsInputTheme: MantineThemeComponents['TagsInput'] = {
  defaultProps: {
    radius: 'md',
    size: 'md',
    variant: 'filled',
  },
  classNames: {
    input: classes.input,
    option: classes.comboboxOption,
    section: classes.inputSection,
  },
  styles: {
    dropdown: comboboxDropdownStyles,
    input: {
      ...filledInputStyles,
      alignItems: 'flex-start',
      gap: '0.375rem',
      paddingBlock: '0.375rem',
    },
    option: comboboxOptionStyles,
    pill: {
      background: 'var(--sl-accent-soft)',
      border: '1px solid color-mix(in srgb, var(--sl-accent) 22%, transparent)',
      color: 'var(--sl-nav-active-text)',
      fontSize: 'inherit',
      fontWeight: 700,
    },
    pillsList: {
      gap: '0.375rem',
    },
    label: controlLabelStyles,
    description: controlDescriptionStyles,
    error: controlErrorStyles,
    inputField: {
      color: 'var(--sl-control-text)',
      fontSize: 'inherit',
    },
    section: inputSectionStyles,
  },
};
