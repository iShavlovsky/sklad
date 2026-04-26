import type { MantineThemeComponents } from '@mantine/core';

export const tableTheme: MantineThemeComponents['Table'] = {
  defaultProps: {
    highlightOnHover: true,
    horizontalSpacing: 'sm',
    striped: 'odd',
    stickyHeader: false,
    tabularNums: true,
    verticalSpacing: 'xs',
    withRowBorders: true,
    withTableBorder: true,
  },
  styles: {
    table: {
      borderColor: 'var(--sl-shell-border)',
      color: 'var(--sl-text)',
    },
    th: {
      backgroundColor: 'var(--sl-surface-subtle)',
      color: 'var(--sl-text)',
      fontSize: 'var(--mantine-font-size-xs)',
      fontWeight: 700,
    },
    td: {
      color: 'var(--sl-text)',
    },
    caption: {
      color: 'var(--sl-muted-text)',
    },
  },
};
