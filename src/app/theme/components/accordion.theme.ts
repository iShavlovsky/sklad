import type { CSSProperties } from 'react';
import type { MantineThemeComponents } from '@mantine/core';

import {
  controlTransition,
  elevatedSurfaceStyles,
} from '@/app/theme/components/shared';

export type AppAccordionSize = 'xxs' | 'xs' | 'sm' | 'md' | 'lg';

const accordionSizeStyles: Record<AppAccordionSize, CSSProperties> = {
  xxs: {
    '--accordion-chevron-size': '0.9375rem',
    '--sl-accordion-gap': '0.25rem',
    '--sl-accordion-radius': '0.8125rem',
    '--sl-accordion-label-font-size': '0.75rem',
    '--sl-accordion-control-padding-block': '0.4375rem',
    '--sl-accordion-control-padding-inline': '0.6875rem',
    '--sl-accordion-content-padding-inline': '0.6875rem',
    '--sl-accordion-content-padding-bottom': '0.6875rem',
  } as CSSProperties,
  xs: {
    '--accordion-chevron-size': '1rem',
    '--sl-accordion-gap': '0.25rem',
    '--sl-accordion-radius': '0.875rem',
    '--sl-accordion-label-font-size': '0.8125rem',
    '--sl-accordion-control-padding-block': '0.5rem',
    '--sl-accordion-control-padding-inline': '0.75rem',
    '--sl-accordion-content-padding-inline': '0.75rem',
    '--sl-accordion-content-padding-bottom': '0.75rem',
  } as CSSProperties,
  sm: {
    '--accordion-chevron-size': '1.0625rem',
    '--sl-accordion-gap': '0.375rem',
    '--sl-accordion-radius': '0.9375rem',
    '--sl-accordion-label-font-size': '0.875rem',
    '--sl-accordion-control-padding-block': '0.625rem',
    '--sl-accordion-control-padding-inline': '0.875rem',
    '--sl-accordion-content-padding-inline': '0.875rem',
    '--sl-accordion-content-padding-bottom': '0.875rem',
  } as CSSProperties,
  md: {
    '--accordion-chevron-size': '1.125rem',
    '--sl-accordion-gap': '0.5rem',
    '--sl-accordion-radius': '1rem',
    '--sl-accordion-label-font-size': '0.9375rem',
    '--sl-accordion-control-padding-block': '0.75rem',
    '--sl-accordion-control-padding-inline': '1rem',
    '--sl-accordion-content-padding-inline': '1rem',
    '--sl-accordion-content-padding-bottom': '1rem',
  } as CSSProperties,
  lg: {
    '--accordion-chevron-size': '1.25rem',
    '--sl-accordion-gap': '0.625rem',
    '--sl-accordion-radius': '1.125rem',
    '--sl-accordion-label-font-size': '1rem',
    '--sl-accordion-control-padding-block': '0.875rem',
    '--sl-accordion-control-padding-inline': '1.125rem',
    '--sl-accordion-content-padding-inline': '1.125rem',
    '--sl-accordion-content-padding-bottom': '1.125rem',
  } as CSSProperties,
};

export function getAccordionSizeStyle(
  size: AppAccordionSize = 'sm'
): CSSProperties {
  return accordionSizeStyles[size];
}

export const accordionTheme: MantineThemeComponents['Accordion'] = {
  defaultProps: {
    chevronPosition: 'right',
    radius: 'md',
    variant: 'separated',
  },
  styles: {
    root: {
      ...accordionSizeStyles.sm,
      display: 'grid',
      gap: 'var(--sl-accordion-gap)',
    },
    item: {
      ...elevatedSurfaceStyles,
      overflow: 'hidden',
      border: '1px solid var(--sl-surface-glass-border)',
      borderRadius: 'var(--sl-accordion-radius)',
      boxShadow:
        '0 10px 22px -18px rgb(15 23 42 / 0.26), 0 2px 8px rgb(15 23 42 / 0.08), inset 0 1px 0 rgb(255 255 255 / 0.16)',
    },
    control: {
      background: 'transparent',
      color: 'var(--sl-text)',
      minHeight: 'auto',
      paddingBlock: 'var(--sl-accordion-control-padding-block)',
      paddingInline: 'var(--sl-accordion-control-padding-inline)',
      transition: controlTransition,
    },
    label: {
      color: 'var(--sl-text)',
      fontSize: 'var(--sl-accordion-label-font-size)',
      fontWeight: 700,
      lineHeight: 1.2,
    },
    chevron: {
      color: 'var(--sl-muted-text)',
      transition:
        'color var(--duration-fast) var(--ease-standard), transform var(--duration-fast) var(--ease-standard)',
    },
    panel: {
      borderTop:
        '1px solid color-mix(in sRGB, var(--sl-shell-border) 72%, transparent)',
    },
    content: {
      background:
        'linear-gradient(180deg, color-mix(in sRGB, var(--sl-nav-active-background) 18%, transparent), color-mix(in sRGB, var(--sl-surface-glass) 94%, transparent) 38%, color-mix(in sRGB, var(--sl-surface-card) 42%, transparent))',
      color: 'var(--sl-text)',
      padding:
        '0 var(--sl-accordion-content-padding-inline) var(--sl-accordion-content-padding-bottom)',
    },
    itemTitle: {
      minWidth: 0,
    },
    itemLabel: {
      color: 'var(--sl-text)',
    },
    itemTrigger: {
      '&[data-active]': {
        background:
          'linear-gradient(180deg, color-mix(in sRGB, var(--sl-nav-active-background) 22%, transparent), color-mix(in sRGB, var(--sl-surface-glass-strong) 94%, transparent))',
      },
    },
  },
};
