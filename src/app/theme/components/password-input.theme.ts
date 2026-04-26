import type { MantineThemeComponents } from '@mantine/core';

import {
  controlDescriptionStyles,
  controlErrorStyles,
} from '@/app/theme/components/shared';

export const passwordInputTheme: MantineThemeComponents['PasswordInput'] = {
  defaultProps: {
    radius: 'md',
    size: 'md',
    variant: 'filled',
  },
  styles: {
    description: controlDescriptionStyles,
    error: controlErrorStyles,
    visibilityToggle: {
      color: 'var(--sl-muted-text)',
    },
  },
};
