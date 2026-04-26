import type { CSSProperties } from 'react';

export type EntityIconTone =
  | 'arrival'
  | 'buffer'
  | 'dashboard'
  | 'departure'
  | 'drafts'
  | 'scanner'
  | 'settings'
  | 'stocks';

type EntityIconToneStyle = CSSProperties & {
  '--entity-icon-background': string;
  '--entity-icon-color': string;
};

export function getEntityIconToneStyle(
  tone: EntityIconTone
): EntityIconToneStyle {
  return {
    '--entity-icon-background': `var(--sl-entity-${tone}-background)`,
    '--entity-icon-color': `var(--sl-entity-${tone}-color)`,
  };
}

export function getEntityAccentSurfaceStyle(
  tone: EntityIconTone
): CSSProperties {
  return {
    ...getEntityIconToneStyle(tone),
    backgroundColor: 'var(--entity-icon-background)',
    border:
      '1px solid color-mix(in srgb, var(--entity-icon-color) 20%, var(--sl-shell-border))',
    color: 'var(--entity-icon-color)',
  };
}
