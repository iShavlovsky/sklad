import type { MantineThemeComponents } from '@mantine/core';

import {
  controlErrorStyles,
  inlineChoiceDescriptionStyles,
  inlineChoiceLabelStyles,
} from '@/app/theme/components/shared';
import classes from '@/app/theme/components/switch.theme.module.css';

export const switchTheme: MantineThemeComponents['Switch'] = {
  defaultProps: {
    color: 'brand',
    size: 'md',
  },
  classNames: {
    input: classes.input,
    track: classes.track,
  },
  styles: {
    body: {
      alignItems: 'center',
      gap: '0.625rem',
    },
    description: inlineChoiceDescriptionStyles,
    error: controlErrorStyles,
    input: {},
    label: {
      ...inlineChoiceLabelStyles,
    },
    track: {
      backgroundColor: 'var(--sl-surface-card)',
      borderColor: 'var(--sl-surface-input-border)',
      transition:
        'border-color var(--duration-fast) var(--ease-standard), background-color var(--duration-fast) var(--ease-standard), box-shadow var(--duration-fast) var(--ease-standard)',
    },
    thumb: {
      boxShadow: 'var(--sl-control-shadow)',
    },
  },
};
