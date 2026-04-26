import type { MantineThemeComponents } from '@mantine/core';

import { controlTransition } from '@/app/theme/components/shared';

export const fieldsetTheme: MantineThemeComponents['Fieldset'] = {
  defaultProps: {
    radius: 'md',
    variant: 'default',
    mb: 0,
  },
  styles: {
    legend: {
      color: 'var(--sl-text)',
      fontSize: 'var(--mantine-font-size-sm)',
      fontWeight: 700,
    },
    fieldset: {
      borderColor: 'var(--sl-shell-border)',
      background: 'var(--sl-surface-card)',
      transition: controlTransition,
    },
  },
};
