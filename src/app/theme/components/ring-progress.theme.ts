import type { MantineThemeComponents } from '@mantine/core';

import { controlTransition } from '@/app/theme/components/shared';

export const ringProgressTheme: MantineThemeComponents['RingProgress'] = {
  defaultProps: {
    rootColor: 'neutralSlate',
    roundCaps: true,
    thickness: 12,
  },
  styles: {
    curve: {
      transition:
        'stroke-dasharray var(--duration-base) var(--ease-standard), stroke-dashoffset var(--duration-base) var(--ease-standard), stroke var(--duration-fast) var(--ease-standard)',
    },
    label: {
      color: 'var(--sl-text)',
      fontSize: 'var(--mantine-font-size-sm)',
      fontWeight: 700,
      transition: controlTransition,
    },
  },
};
