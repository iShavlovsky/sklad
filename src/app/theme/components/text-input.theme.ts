import type { MantineThemeComponents } from '@mantine/core';

import {
  controlDescriptionStyles,
  controlErrorStyles,
} from '@/app/theme/components/shared';

export const textInputTheme: MantineThemeComponents['TextInput'] = {
  defaultProps: {
    radius: 'md',
    size: 'md',
    variant: 'filled',
  },
  styles: {
    description: controlDescriptionStyles,
    error: controlErrorStyles,
  },
};
