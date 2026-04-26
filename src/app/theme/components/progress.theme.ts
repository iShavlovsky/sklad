import type { MantineThemeComponents } from '@mantine/core';

import { controlTransition } from '@/app/theme/components/shared';

export const progressTheme: MantineThemeComponents['Progress'] = {
  defaultProps: {
    color: 'brand',
    radius: 'xl',
    size: 'md',
  },
  styles: {
    root: {
      backgroundColor: 'var(--sl-surface-subtle)',
    },
    section: {
      transition:
        'width var(--duration-base) var(--ease-standard), background-color var(--duration-fast) var(--ease-standard), transform var(--duration-fast) var(--ease-standard)',
    },
    label: {
      transition: controlTransition,
    },
  },
};
