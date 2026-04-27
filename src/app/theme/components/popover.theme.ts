import type { MantineThemeComponents } from '@mantine/core';

export const popoverTheme: MantineThemeComponents['Popover'] = {
  defaultProps: {
    radius: 'md',
    shadow: 'md',
  },
  styles: {
    dropdown: {
      background: 'var(--sl-shell-panel-background)',
      border: '1px solid var(--sl-surface-glass-border)',
      borderRadius: 'var(--sl-section-radius)',
      boxShadow: 'var(--sl-panel-shadow)',
      backdropFilter: 'blur(var(--sl-glass-blur))',
      WebkitBackdropFilter: 'blur(var(--sl-glass-blur))',
    },
  },
};
