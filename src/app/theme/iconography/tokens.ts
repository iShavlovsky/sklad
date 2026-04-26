export const appIconPack = '@tabler/icons-react' as const;

export const appIconStrokeWidth = 1.75;

export const appIconSizeTokens = {
  xxs: 12,
  xs: 14,
  sm: 16,
  md: 18,
  lg: 20,
  xl: 24,
} as const;

export type AppIconSizeKey = keyof typeof appIconSizeTokens;

export const appIconUsageTokens = {
  inline: 'sm',
  helper: 'sm',
  fieldSection: 'sm',
  actionCompact: 'md',
  actionTouch: 'lg',
  navigation: 'lg',
  emphasis: 'xl',
} as const satisfies Record<string, AppIconSizeKey>;

export const appIconographyGuidance = [
  'One canonical pack: @tabler/icons-react.',
  'One canonical style: outline icons with currentColor fill behavior and fixed stroke width.',
  'Icons inherit color from the parent control or text role instead of carrying local ad hoc colors.',
  'Use compact sizes for inline/support contexts and larger sizes only for navigation or touch-first actions.',
  'Do not create a global barrel that re-exports the whole pack.',
] as const;

export function getAppIconProps(size: AppIconSizeKey) {
  return {
    size: appIconSizeTokens[size],
    stroke: appIconStrokeWidth,
  } as const;
}
