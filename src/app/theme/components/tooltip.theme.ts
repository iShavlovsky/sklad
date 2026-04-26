import type { MantineThemeComponents } from '@mantine/core';

export const tooltipTheme: MantineThemeComponents['Tooltip'] = {
  defaultProps: {
    withArrow: true,
    openDelay: 200,
    radius: 'sm',
    transitionProps: {
      transition: 'fade-down',
      duration: 140,
      timingFunction: 'var(--ease-standard)',
    },
  },
  styles: {
    tooltip: {
      backgroundColor: 'var(--sl-text)',
      color: 'var(--sl-surface-card)',
      fontSize: 'var(--mantine-font-size-xs)',
      fontWeight: 600,
      boxShadow: 'var(--sl-panel-shadow)',
      transition:
        'opacity var(--duration-fast) var(--ease-standard), transform var(--duration-fast) var(--ease-standard)',
    },
  },
};
