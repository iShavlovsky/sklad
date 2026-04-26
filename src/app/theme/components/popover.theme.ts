import type { MantineThemeComponents } from '@mantine/core';

export const popoverTheme: MantineThemeComponents['Popover'] = {
  defaultProps: {
    radius: 'md',
    shadow: 'md',
  },
  styles: {
    dropdown: {
      backgroundColor: 'var(--sl-surface-card)',
      border: '1px solid var(--sl-shell-border)',
      borderRadius: 'var(--sl-section-radius)',
      boxShadow: 'var(--sl-panel-shadow)',
    },
  },
};
