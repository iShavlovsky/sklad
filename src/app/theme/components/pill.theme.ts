import type {
  MantineTheme,
  MantineThemeComponents,
  PillProps,
} from '@mantine/core';

import classes from '@/app/theme/components/pill.theme.module.css';

export const pillTheme: MantineThemeComponents['Pill'] = {
  defaultProps: {
    radius: 'pill',
    withRemoveButton: false,
    size: 'sm',
  },
  vars: (_theme: MantineTheme, props: PillProps) => {
    const size = props.size ?? 'sm';

    if (size === 'xs') {
      return {
        root: {
          '--pill-height': '1.125rem',
          '--pill-fz': '0.625rem',
          '--pill-radius': '999px',
        },
      };
    }

    if (size === 'lg') {
      return {
        root: {
          '--pill-height': '1.625rem',
          '--pill-fz': '0.8125rem',
          '--pill-radius': '999px',
        },
      };
    }

    if (size === 'md') {
      return {
        root: {
          '--pill-height': '1.375rem',
          '--pill-fz': '0.6875rem',
          '--pill-radius': '999px',
        },
      };
    }

    return {
      root: {
        '--pill-height': '1.25rem',
        '--pill-fz': '0.625rem',
        '--pill-radius': '999px',
      },
    };
  },
  classNames: {
    remove: classes.remove,
  },
  styles: {
    root: {
      background: 'var(--sl-accent-soft)',
      border: '1px solid color-mix(in srgb, var(--sl-accent) 22%, transparent)',
      color: 'var(--sl-nav-active-text)',
      fontWeight: 700,
    },
    label: {
      color: 'inherit',
      fontSize: 'inherit',
      lineHeight: 1,
    },
    remove: {
      color: 'inherit',
      opacity: 0.72,
      transition: 'opacity var(--duration-fast) var(--ease-standard)',
    },
  },
};
