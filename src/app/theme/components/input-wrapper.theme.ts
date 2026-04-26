import type { MantineThemeComponents } from '@mantine/core';

import { controlLabelStyles } from '@/app/theme/components/shared';

export const inputWrapperTheme: MantineThemeComponents['InputWrapper'] = {
  defaultProps: {
    inputWrapperOrder: ['label', 'input', 'description', 'error'],
  },
  styles: {
    label: controlLabelStyles,
    required: {
      color: 'var(--sl-app-danger)',
      fontWeight: 700,
    },
    description: {
      color: 'var(--sl-muted-text)',
    },
    error: {
      color: 'var(--sl-app-danger)',
    },
  },
};
