import type {
  ButtonProps,
  MantineTheme,
  MantineThemeComponents,
} from '@mantine/core';

import classes from '@/app/theme/components/button.theme.module.css';

export type FormActionButtonPreset = 'cancel' | 'save' | 'create';

export const formActionButtonPresets = {
  cancel: {
    color: 'error',
    size: 'sm',
    variant: 'light',
  },
  create: {
    size: 'sm',
  },
  save: {
    color: 'warning',
    size: 'sm',
    variant: 'default',
  },
} as const satisfies Record<
  FormActionButtonPreset,
  Pick<ButtonProps, 'color' | 'size' | 'variant'>
>;

export const buttonTheme: MantineThemeComponents['Button'] = {
  defaultProps: {
    radius: 'md',
    size: 'md',
    color: 'brand',
    variant: 'filled',
  },
  vars: (_theme: MantineTheme, props: ButtonProps) => {
    const size = props.size ?? 'md';

    if (size === 'xxxs') {
      return {
        root: {
          '--button-height': '1.25rem',
          '--button-padding-x': '0.5rem',
          '--button-fz': '0.625rem',
        },
      };
    }

    if (size === 'xxs') {
      return {
        root: {
          '--button-height': '1.5rem',
          '--button-padding-x': '0.625rem',
          '--button-fz': '0.6875rem',
        },
      };
    }

    if (size === 'xs') {
      return {
        root: {
          '--button-height': '1.875rem',
          '--button-padding-x': '0.75rem',
          '--button-fz': '0.75rem',
        },
      };
    }

    if (size === 'sm') {
      return {
        root: {
          '--button-height': '2.25rem',
          '--button-padding-x': '0.875rem',
          '--button-fz': '0.8125rem',
        },
      };
    }

    if (size === 'lg') {
      return {
        root: {
          '--button-height': '3.125rem',
          '--button-padding-x': '1.125rem',
          '--button-fz': '0.9375rem',
        },
      };
    }

    if (size === 'xl') {
      return {
        root: {
          '--button-height': '3.625rem',
          '--button-padding-x': '1.375rem',
          '--button-fz': '1rem',
        },
      };
    }

    return {
      root: {
        '--button-height': '2.625rem',
        '--button-padding-x': '1rem',
        '--button-fz': '0.875rem',
      },
    };
  },
  classNames: {
    root: classes.root,
    section: classes.section,
  },
  styles: {
    root: {
      borderRadius: 'var(--sl-control-radius)',
      fontWeight: 700,
      transition:
        'transform var(--duration-fast) var(--ease-standard), box-shadow var(--duration-fast) var(--ease-standard), background-color var(--duration-fast) var(--ease-standard), border-color var(--duration-fast) var(--ease-standard), color var(--duration-fast) var(--ease-standard)',
    },
    label: {
      color: 'inherit',
    },
    section: {
      color: 'inherit',
      fontSize: 'inherit',
    },
  },
};
