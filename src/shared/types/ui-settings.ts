export const THEME_PREFERENCE_KEY = 'ui.theme.preference';

export type ThemePreference = 'light' | 'dark';

export interface UiThemeSettings {
  themePreference: ThemePreference;
}

export const THEME_PREFERENCE_OPTIONS: ThemePreference[] = ['light', 'dark'];

export const THEME_PREFERENCE_LABELS: Record<ThemePreference, string> = {
  light: 'Светлая',
  dark: 'Тёмная',
};

export function isThemePreference(value: unknown): value is ThemePreference {
  return value === 'light' || value === 'dark';
}

export function parseThemePreference(
  value: unknown
): ThemePreference | undefined {
  return isThemePreference(value) ? value : undefined;
}
