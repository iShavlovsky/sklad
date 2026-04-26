import type { MantineThemeComponents } from '@mantine/core';

import {
  controlDescriptionStyles,
  controlErrorStyles,
} from '@/app/theme/components/shared';

export const textareaTheme: MantineThemeComponents['Textarea'] = {
  defaultProps: {
    radius: 'md',
    size: 'md',
    variant: 'filled',
  },
  styles: {
    input: {
      paddingTop: '0.625rem',
      paddingBottom: '0.625rem',
    },
    description: controlDescriptionStyles,
    error: controlErrorStyles,
  },
};
