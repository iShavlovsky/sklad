import type { AppThemeColorName } from '@/app/theme/colors/palettes';
import { appBorderTokens, appSizeTokens } from '@/app/theme/layout/tokens';
import type { AppThemeOther } from '@/app/theme/types/app-theme-other';
import type { ThemePreference } from '@/shared/types/ui-settings';

export interface AppThemeModeConfig {
  primaryColor: AppThemeColorName;
  other: AppThemeOther;
  shadowAmbient: string;
  shadowRaised: string;
}

const createThemeOther = (input: {
  surface: AppThemeOther['surface'];
  border: AppThemeOther['border'];
  text: AppThemeOther['text'];
  focus: AppThemeOther['focus'];
  intent: AppThemeOther['intent'];
  scannerOverlay: string;
  sync: AppThemeOther['sync'];
}): AppThemeOther => ({
  surface: {
    ...input.surface,
  },
  border: {
    ...input.border,
  },
  text: {
    ...input.text,
  },
  focus: {
    ...input.focus,
  },
  intent: {
    ...input.intent,
  },
  shell: {
    headerHeight: appSizeTokens.headerHeight,
    bottomNavHeight: appSizeTokens.bottomNavHeight,
  },
  scanner: {
    overlay: input.scannerOverlay,
  },
  sync: {
    ...input.sync,
  },
});

export const themeModeConfigs: Record<ThemePreference, AppThemeModeConfig> = {
  light: {
    primaryColor: 'brandBlue',
    shadowAmbient: '0 12px 28px rgb(33 96 214 / 0.16)',
    shadowRaised: '0 16px 32px rgb(33 96 214 / 0.22)',
    other: createThemeOther({
      surface: {
        background: '#f3f7fc',
        paper: '#ffffff',
        raised: '#f6f9ff',
        subtleSurface: '#edf4fc',
        glass: 'rgb(255 255 255 / 0.58)',
        glassStrong: 'rgb(255 255 255 / 0.76)',
        glassBorder: 'rgb(255 255 255 / 0.52)',
        shell: 'rgb(255 255 255 / 0.64)',
        ambientA: 'rgb(104 165 255 / 0.28)',
        ambientB: 'rgb(191 226 255 / 0.34)',
        highlight: 'rgb(255 255 255 / 0.92)',
        haze: 'rgb(231 241 252 / 0.86)',
      },
      border: {
        default: '#e5e7eb',
        strong: '#cbd5e1',
      },
      text: {
        primary: '#0f172a',
        secondary: '#64748b',
      },
      focus: {
        ring: '#7da8ff',
        offset: appBorderTokens.focusOffset,
        width: appBorderTokens.focusWidth,
      },
      intent: {
        primary: '#3686ff',
        success: '#22c55e',
        warning: '#f59e0b',
        error: '#ef4444',
        info: '#3b82f6',
      },
      scannerOverlay: 'rgb(15 23 42 / 0.42)',
      sync: {
        offline: '#94a3b8',
        pending: '#356ef6',
        synced: '#22c55e',
        error: '#ef4444',
      },
    }),
  },
  dark: {
    primaryColor: 'brandBlue',
    shadowAmbient: '0 16px 36px rgb(89 139 255 / 0.2)',
    shadowRaised: '0 18px 42px rgb(89 139 255 / 0.24)',
    other: createThemeOther({
      surface: {
        background: '#0b0f14',
        paper: '#111827',
        raised: '#172131',
        subtleSurface: '#1f2937',
        glass: 'rgb(17 24 39 / 0.72)',
        glassStrong: 'rgb(23 33 49 / 0.82)',
        glassBorder: 'rgb(148 163 184 / 0.16)',
        shell: 'rgb(17 24 39 / 0.74)',
        ambientA: 'rgb(89 139 255 / 0.22)',
        ambientB: 'rgb(51 65 85 / 0.42)',
        highlight: 'rgb(255 255 255 / 0.06)',
        haze: 'rgb(15 23 42 / 0.42)',
      },
      border: {
        default: '#2c3440',
        strong: '#475569',
      },
      text: {
        primary: '#e5e7eb',
        secondary: '#94a3b8',
      },
      focus: {
        ring: '#7da8ff',
        offset: appBorderTokens.focusOffset,
        width: appBorderTokens.focusWidth,
      },
      intent: {
        primary: '#598bff',
        success: '#22c55e',
        warning: '#f59e0b',
        error: '#ef4444',
        info: '#3b82f6',
      },
      scannerOverlay: 'rgb(2 6 23 / 0.62)',
      sync: {
        offline: '#64748b',
        pending: '#598bff',
        synced: '#22c55e',
        error: '#ef4444',
      },
    }),
  },
};
