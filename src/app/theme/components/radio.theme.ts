import type { MantineThemeComponents } from '@mantine/core';

import classes from '@/app/theme/components/radio.theme.module.css';
import {
  controlErrorStyles,
  inlineChoiceDescriptionStyles,
  inlineChoiceLabelStyles,
} from '@/app/theme/components/shared';

export const radioTheme: MantineThemeComponents['Radio'] = {
  defaultProps: {
    color: 'brand',
    labelPosition: 'right',
    size: 'md',
  },
  classNames: {
    radio: classes.radio,
  },
  styles: {
    body: {
      alignItems: 'center',
      gap: '0.625rem',
    },
    description: inlineChoiceDescriptionStyles,
    error: controlErrorStyles,
    radio: {
      borderColor: 'var(--sl-surface-input-border)',
      boxShadow: 'none',
      transition:
        'border-color var(--duration-fast) var(--ease-standard), background-color var(--duration-fast) var(--ease-standard), box-shadow var(--duration-fast) var(--ease-standard)',
    },
    icon: {
      color: '#fff',
    },
    label: {
      ...inlineChoiceLabelStyles,
    },
  },
};
