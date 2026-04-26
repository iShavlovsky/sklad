export const appSpacingScaleTokens = {
  4: '0.25rem',
  8: '0.5rem',
  12: '0.75rem',
  16: '1rem',
  20: '1.25rem',
  24: '1.5rem',
  32: '2rem',
  40: '2.5rem',
  48: '3rem',
} as const;

export const appSpacingTokens = {
  xxs: '0.25rem',
  xs: '0.5rem',
  sm: '0.75rem',
  md: '1rem',
  lg: '1.25rem',
  xl: '1.5rem',
  xxl: '2rem',
} as const;

export const appRadiusScaleTokens = {
  borderHairline: '1px',
  borderSoft: '2px',
  xs: '0.25rem',
  sm: '0.5rem',
  md: '0.75rem',
  lg: '1rem',
  xl: '1.25rem',
} as const;

export const appRadiusTokens = {
  chip: 7,
  control: 8,
  section: 10,
  shell: 14,
  pill: 999,
} as const;

export const appShadowScaleTokens = {
  xs: '0 1px 2px 0 rgb(16 24 40 / 0.04)',
  sm: '0 2px 6px -1px rgb(16 24 40 / 0.06)',
  md: '0 6px 16px -2px rgb(16 24 40 / 0.08)',
  lg: '0 12px 28px -4px rgb(16 24 40 / 0.12)',
} as const;

export const appShadowTokens = {
  shell: appShadowScaleTokens.lg,
  panel: appShadowScaleTokens.md,
  control: appShadowScaleTokens.sm,
  ambient: appShadowScaleTokens.md,
  raised: appShadowScaleTokens.lg,
} as const;

export const appSizeTokens = {
  touchTargetMin: '3rem',
  headerHeight: '3.5rem',
  bottomNavHeight: '4.25rem',
  controlHeight: '2.5rem',
  buttonHeight: '2.75rem',
} as const;

export const appBorderTokens = {
  softWidth: '1px',
  strongWidth: '1px',
  focusWidth: '2px',
  focusOffset: '2px',
} as const;

export const appBreakpointTokens = {
  largePhone: '26.75em',
  tablet: '48em',
  desktop: '64em',
  wide: '75em',
  ultraWide: '87.5em',
} as const;

export const appShellLayoutTokens = {
  referenceViewportWidth: '17.5rem',
  denseContentWidth: '17rem',
  maxWidth: '37.5rem',
  minWidth: '17.5rem',
  railPadding: 'clamp(0.625rem, 3vw, 0.875rem)',
  pageTopPadding: 'clamp(0.75rem, 3vw, 1rem)',
  pageBottomPadding:
    'calc(clamp(1rem, 3.5vw, 1.25rem) + env(safe-area-inset-bottom))',
  pageSectionGap: 'clamp(0.75rem, 3vw, 1rem)',
  pageBottomSpacer: 'clamp(0.75rem, 3vw, 1rem)',
} as const;

export const appMotionTokens = {
  fast: '120ms',
  base: '180ms',
  slow: '260ms',
  easeStandard: 'cubic-bezier(0.2, 0.8, 0.2, 1)',
  easeEnter: 'cubic-bezier(0.16, 1, 0.3, 1)',
  easeExit: 'cubic-bezier(0.4, 0, 0.2, 1)',
} as const;
