import type { MantineThemeComponents } from '@mantine/core';

export const appShellTheme: MantineThemeComponents['AppShell'] = {
  defaultProps: {
    padding: 0,
  },
  styles: {
    main: {
      background: 'var(--sl-app-canvas-background)',
    },
    header: {
      background: 'var(--sl-shell-panel-background)',
      borderBottom: '1px solid var(--sl-surface-glass-border)',
      boxShadow: '0 8px 24px rgb(148 184 255 / 0.1)',
      backdropFilter: 'blur(var(--sl-glass-blur))',
      WebkitBackdropFilter: 'blur(var(--sl-glass-blur))',
    },
    footer: {
      background: 'transparent',
      borderTop: '0',
      boxShadow: 'none',
    },
  },
};
