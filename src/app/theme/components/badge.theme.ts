import type {
  BadgeProps,
  MantineTheme,
  MantineThemeComponents,
} from '@mantine/core';

import classes from '@/app/theme/components/badge.theme.module.css';

export const badgeTheme: MantineThemeComponents['Badge'] = {
  defaultProps: {
    radius: 'sm',
    variant: 'light',
    size: 'sm',
  },
  vars: (_theme: MantineTheme, props: BadgeProps) => {
    const size = props.size ?? 'sm';

    if (size === 'xs') {
      return {
        root: {
          '--badge-height': '1.125rem',
          '--badge-padding-x': '0.375rem',
          '--badge-fz': '0.625rem',
        },
      };
    }

    if (size === 'lg') {
      return {
        root: {
          '--badge-height': '1.625rem',
          '--badge-padding-x': '0.625rem',
          '--badge-fz': '0.8125rem',
        },
      };
    }

    if (size === 'md') {
      return {
        root: {
          '--badge-height': '1.375rem',
          '--badge-padding-x': '0.5rem',
          '--badge-fz': '0.6875rem',
        },
      };
    }

    return {
      root: {
        '--badge-height': '1.25rem',
        '--badge-padding-x': '0.4375rem',
        '--badge-fz': '0.625rem',
      },
    };
  },
  classNames: {
    section: classes.section,
  },
  styles: {
    root: {
      border: '1px solid transparent',
      gap: '0.25rem',
      fontWeight: 700,
      transition:
        'background-color var(--duration-fast) var(--ease-standard), border-color var(--duration-fast) var(--ease-standard), color var(--duration-fast) var(--ease-standard)',
    },
    label: {
      color: 'inherit',
      fontSize: 'inherit',
    },
    section: {
      color: 'inherit',
      fontSize: 'inherit',
    },
  },
};
