import type {
  ActionIconProps,
  MantineTheme,
  MantineThemeComponents,
} from '@mantine/core';

import classes from '@/app/theme/components/action-icon.theme.module.css';

export const actionIconTheme: MantineThemeComponents['ActionIcon'] = {
  defaultProps: {
    radius: 'md',
    size: 'lg',
    variant: 'light',
    color: 'brand',
  },
  vars: (_theme: MantineTheme, props: ActionIconProps) => {
    const size = props.size ?? 'lg';

    if (size === 'xxxs') {
      return {
        root: {
          '--ai-size': '1rem',
        },
      };
    }

    if (size === 'xxs') {
      return {
        root: {
          '--ai-size': '1.125rem',
        },
      };
    }

    if (size === 'xs') {
      return {
        root: {
          '--ai-size': '1.375rem',
        },
      };
    }

    if (size === 'sm') {
      return {
        root: {
          '--ai-size': '1.75rem',
        },
      };
    }

    if (size === 'md') {
      return {
        root: {
          '--ai-size': '2rem',
        },
      };
    }

    if (size === 'lg') {
      return {
        root: {
          '--ai-size': '2.5rem',
        },
      };
    }

    if (size === 'xl') {
      return {
        root: {
          '--ai-size': '3rem',
        },
      };
    }

    return {
      root: {
        '--ai-size': '2.5rem',
      },
    };
  },
  classNames: {
    root: classes.root,
  },
  styles: (_theme: MantineTheme, props: ActionIconProps) => ({
    root: {
      borderRadius: 'var(--sl-control-radius)',
      ...(props.variant === 'light' && props.color === 'brand'
        ? {
            backgroundColor: 'var(--sl-accent-soft)',
            border:
              '1px solid color-mix(in srgb, var(--sl-accent-strong) 22%, var(--sl-shell-border))',
            color: 'var(--sl-accent-strong)',
          }
        : {}),
      transition:
        'background-color var(--duration-fast) var(--ease-standard), color var(--duration-fast) var(--ease-standard), border-color var(--duration-fast) var(--ease-standard), box-shadow var(--duration-fast) var(--ease-standard), transform var(--duration-fast) var(--ease-standard)',
    },
  }),
};
