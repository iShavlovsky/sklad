import type {
  InputProps,
  MantineTheme,
  MantineThemeComponents,
} from '@mantine/core';

import {
  filledInputStyles,
  inputSectionStyles,
} from '@/app/theme/components/shared';
import classes from '@/app/theme/components/shared-input.theme.module.css';

export const inputTheme: MantineThemeComponents['Input'] = {
  defaultProps: {
    radius: 'md',
    size: 'md',
    variant: 'filled',
  },
  vars: (_theme: MantineTheme, props: InputProps) => {
    const size = props.size ?? 'md';

    if (size === 'xxxs') {
      return {
        wrapper: {
          '--input-height': '1.375rem',
          '--input-fz': '0.625rem',
          ...(props.multiline === true
            ? { '--input-padding-y': '0.25rem' }
            : {}),
        },
      };
    }

    if (size === 'xxs') {
      return {
        wrapper: {
          '--input-height': '1.625rem',
          '--input-fz': '0.6875rem',
          ...(props.multiline === true
            ? { '--input-padding-y': '0.3125rem' }
            : {}),
        },
      };
    }

    if (size === 'xs') {
      return {
        wrapper: {
          '--input-height': '1.875rem',
          '--input-fz': '0.75rem',
          ...(props.multiline === true
            ? { '--input-padding-y': '0.3125rem' }
            : {}),
        },
      };
    }

    if (size === 'sm') {
      return {
        wrapper: {
          '--input-height': '2.25rem',
          '--input-fz': '0.8125rem',
          ...(props.multiline === true
            ? { '--input-padding-y': '0.375rem' }
            : {}),
        },
      };
    }

    if (size === 'lg') {
      return {
        wrapper: {
          '--input-height': '3.125rem',
          '--input-fz': '0.9375rem',
          ...(props.multiline === true
            ? { '--input-padding-y': '0.625rem' }
            : {}),
        },
      };
    }

    if (size === 'xl') {
      return {
        wrapper: {
          '--input-height': '3.625rem',
          '--input-fz': '1rem',
          ...(props.multiline === true
            ? { '--input-padding-y': '0.75rem' }
            : {}),
        },
      };
    }

    return {
      wrapper: {
        '--input-height': '2.625rem',
        '--input-fz': '0.875rem',
        ...(props.multiline === true ? { '--input-padding-y': '0.5rem' } : {}),
      },
    };
  },
  classNames: {
    input: classes.input,
    section: classes.inputSection,
  },
  styles: {
    input: filledInputStyles,
    section: inputSectionStyles,
  },
};
