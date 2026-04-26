import type { MantineThemeComponents } from '@mantine/core';

export const indicatorTheme: MantineThemeComponents['Indicator'] = {
  defaultProps: {
    color: 'brand',
    size: 16,
    withBorder: true,
  },
  styles: {
    root: {
      display: 'inline-flex',
      overflow: 'visible',
    },
    indicator: {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      minWidth: '1rem',
      height: '1rem',
      paddingInline: '0.25rem',
      borderRadius: '999px',
      boxShadow: 'var(--sl-control-shadow)',
      fontWeight: 700,
      lineHeight: 1,
      transition:
        'transform var(--duration-fast) var(--ease-standard), box-shadow var(--duration-fast) var(--ease-standard), background-color var(--duration-fast) var(--ease-standard), color var(--duration-fast) var(--ease-standard)',
    },
  },
};
