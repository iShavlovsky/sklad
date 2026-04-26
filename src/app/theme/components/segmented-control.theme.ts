import type { MantineThemeComponents } from '@mantine/core';

export const segmentedControlTheme: MantineThemeComponents['SegmentedControl'] =
  {
    defaultProps: {
      radius: 'md',
      size: 'md',
      fullWidth: true,
    },
    styles: {
      root: {
        backgroundColor: 'var(--sl-surface-subtle)',
        border: '1px solid var(--sl-shell-border)',
        borderRadius: 'var(--sl-control-radius)',
        padding: '0.25rem',
      },
      control: {
        borderRadius: 'var(--sl-control-radius)',
      },
      indicator: {
        backgroundColor: 'var(--sl-surface-card)',
        boxShadow: 'var(--mantine-shadow-md)',
      },
      label: {
        color: 'var(--sl-text)',
        fontWeight: 600,
        transition:
          'color var(--duration-fast) var(--ease-standard), background-color var(--duration-fast) var(--ease-standard)',
      },
      innerLabel: {
        color: 'inherit',
      },
    },
  };
