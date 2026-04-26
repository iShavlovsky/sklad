import type { MantineThemeComponents } from '@mantine/core';

import {
  controlDescriptionStyles,
  controlErrorStyles,
} from '@/app/theme/components/shared';

export const numberInputTheme: MantineThemeComponents['NumberInput'] = {
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
