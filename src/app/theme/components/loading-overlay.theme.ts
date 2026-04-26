import type { MantineThemeComponents } from '@mantine/core';

export const loadingOverlayTheme: MantineThemeComponents['LoadingOverlay'] = {
  defaultProps: {
    overlayProps: {
      blur: 2,
      backgroundOpacity: 0.2,
    },
  },
  styles: {
    root: {
      borderRadius: 'inherit',
    },
  },
};
