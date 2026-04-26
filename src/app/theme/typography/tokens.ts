export type AppTypographyToken = {
  fontFamily?: string;
  fontSize: string;
  fontVariantNumeric?: 'tabular-nums';
  fontWeight: string;
  letterSpacing?: string;
  lineHeight: string;
};

export const fontFamily =
  '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';

export const fontFamilyMonospace =
  '"SF Mono", "JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace';

export const fontWeights = {
  thin: '100',
  extraLight: '200',
  light: '300',
  regular: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
  extraBold: '800',
  black: '900',
} as const;

export const fontSizes = {
  xs: '0.75rem',
  sm: '0.875rem',
  md: '1rem',
  lg: '1.125rem',
  xl: '1.375rem',
} as const;

export const lineHeights = {
  xs: '1.33',
  sm: '1.4',
  md: '1.43',
  lg: '1.5',
  xl: '1.27',
} as const;

export const headingStyleTokens = {
  h1: {
    fontSize: '1.75rem',
    fontWeight: fontWeights.bold,
    letterSpacing: '-0.02em',
    lineHeight: '1.29',
  },
  h2: {
    fontSize: '1.375rem',
    fontWeight: fontWeights.semibold,
    letterSpacing: '-0.01em',
    lineHeight: '1.27',
  },
  h3: {
    fontSize: '1.125rem',
    fontWeight: fontWeights.semibold,
    lineHeight: '1.33',
  },
  h4: {
    fontSize: '1rem',
    fontWeight: fontWeights.semibold,
    lineHeight: '1.38',
  },
  h5: {
    fontSize: '0.875rem',
    fontWeight: fontWeights.semibold,
    letterSpacing: '-0.01em',
    lineHeight: '1.43',
  },
  h6: {
    fontSize: '0.75rem',
    fontWeight: fontWeights.semibold,
    letterSpacing: '0.02em',
    lineHeight: '1.33',
  },
} as const satisfies Record<
  'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6',
  AppTypographyToken
>;

export const bodyStyleTokens = {
  bodyLarge: {
    fontSize: '1rem',
    fontWeight: fontWeights.regular,
    lineHeight: '1.5',
  },
  bodyRegular: {
    fontSize: '0.875rem',
    fontWeight: fontWeights.regular,
    lineHeight: '1.43',
  },
  bodySmall: {
    fontSize: '0.75rem',
    fontWeight: fontWeights.regular,
    lineHeight: '1.33',
  },
  caption: {
    fontSize: '0.75rem',
    fontWeight: fontWeights.regular,
    lineHeight: '1.33',
  },
  label: {
    fontSize: '0.6875rem',
    fontWeight: fontWeights.medium,
    letterSpacing: '0.02em',
    lineHeight: '1.27',
  },
  helper: {
    fontSize: '0.625rem',
    fontWeight: fontWeights.regular,
    lineHeight: '1.4',
  },
  numeric: {
    fontSize: '1rem',
    fontVariantNumeric: 'tabular-nums',
    fontWeight: fontWeights.medium,
    lineHeight: '1.5',
  },
} as const satisfies Record<
  | 'bodyLarge'
  | 'bodyRegular'
  | 'bodySmall'
  | 'caption'
  | 'label'
  | 'helper'
  | 'numeric',
  AppTypographyToken
>;

export const headingTokens = {
  fontFamily,
  fontWeight: fontWeights.bold,
  textWrap: 'balance',
  sizes: headingStyleTokens,
} as const;

export const lineHeightGuidance = [
  {
    description: 'Плотнее для акцента и компактности.',
    label: 'Заголовки (H1-H6)',
    value: '1.20 - 1.35',
  },
  {
    description: 'Оптимально для длинных текстов.',
    label: 'Основной текст',
    value: '1.40 - 1.60',
  },
  {
    description: 'Баланс плотности и читаемости.',
    label: 'Подписи и вспомогательный текст',
    value: '1.30 - 1.45',
  },
  {
    description: 'Компактность интерфейса.',
    label: 'Короткий текст / метки',
    value: '1.20 - 1.30',
  },
  {
    description: 'Выравнивание с основным текстом.',
    label: 'Числовой текст',
    value: '1.40 - 1.60',
  },
] as const;

export const fontWeightScale = [
  { key: 'thin', label: 'Thin', value: 100 },
  { key: 'extraLight', label: 'Extra Light', value: 200 },
  { key: 'light', label: 'Light', value: 300 },
  { key: 'regular', label: 'Regular', value: 400 },
  { key: 'medium', label: 'Medium', value: 500 },
  { key: 'semibold', label: 'SemiBold', value: 600 },
  { key: 'bold', label: 'Bold', value: 700 },
  { key: 'extraBold', label: 'Extra Bold', value: 800 },
  { key: 'black', label: 'Black', value: 900 },
] as const;
