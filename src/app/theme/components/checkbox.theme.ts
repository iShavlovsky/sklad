import type { MantineThemeComponents } from '@mantine/core';

import classes from '@/app/theme/components/checkbox.theme.module.css';
import {
  controlErrorStyles,
  inlineChoiceDescriptionStyles,
  inlineChoiceLabelStyles,
} from '@/app/theme/components/shared';

export const checkboxTheme: MantineThemeComponents['Checkbox'] = {
  defaultProps: {
    color: 'brand',
    labelPosition: 'right',
    radius: 'sm',
    size: 'md',
    variant: 'filled',
  },
  classNames: {
    input: classes.input,
  },
  styles: {
    body: {
      alignItems: 'center',
      gap: '0.625rem',
    },
    description: inlineChoiceDescriptionStyles,
    error: controlErrorStyles,
    icon: {
      color: '#fff',
    },
    input: {
      borderColor: 'var(--sl-surface-input-border)',
      boxShadow: 'none',
      transition:
        'border-color var(--duration-fast) var(--ease-standard), background-color var(--duration-fast) var(--ease-standard), box-shadow var(--duration-fast) var(--ease-standard)',
    },
    label: {
      ...inlineChoiceLabelStyles,
    },
  },
};
