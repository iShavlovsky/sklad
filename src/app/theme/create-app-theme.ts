import {
  createTheme,
  type CSSVariablesResolver,
  defaultVariantColorsResolver,
  type MantineThemeOverride,
  virtualColor,
} from '@mantine/core';

import { appColorPalettes } from '@/app/theme/colors/palettes';
import { themeComponents } from '@/app/theme/components';
import {
  appBorderTokens,
  appBreakpointTokens,
  appMotionTokens,
  appRadiusTokens,
  appShadowTokens,
  appShellLayoutTokens,
  appSizeTokens,
  appSpacingTokens,
} from '@/app/theme/layout/tokens';
import { themeModeConfigs } from '@/app/theme/tokens';
import {
  fontFamily,
  fontFamilyMonospace,
  fontSizes,
  fontWeights,
  headingTokens,
  lineHeights,
} from '@/app/theme/typography/tokens';
import type { ThemePreference } from '@/shared/types/ui-settings';

type ThemeCssVariables = Record<`--${string}`, string>;

export const appThemeDefaults = {
  autoContrast: true,
  defaultRadius: 'md',
  focusRing: 'auto',
  luminanceThreshold: 0.34,
  primaryColor: 'brand',
  primaryShade: {
    dark: 4,
    light: 5,
  },
} as const;

const brandColorShades = (shades: readonly string[]): ThemeCssVariables =>
  shades.reduce<ThemeCssVariables>((acc, value, index) => {
    acc[`--mantine-color-brand-${index}`] = value;

    return acc;
  }, {});

const buildThemeCssVariables = (
  themePreference: ThemePreference
): ThemeCssVariables => {
  const isDark = themePreference === 'dark';
  const activeTheme = themeModeConfigs[themePreference];
  const primaryPalette = appColorPalettes[activeTheme.primaryColor];
  const errorPalette = appColorPalettes.error;
  const infoPalette = appColorPalettes.info;
  const neutralPalette = appColorPalettes.neutralSlate;
  const successPalette = appColorPalettes.success;
  const warningPalette = appColorPalettes.warning;
  const { border, focus, intent, scanner, shell, surface, sync, text } =
    activeTheme.other;
  const accentSoft = isDark ? primaryPalette[8] : primaryPalette[1];
  const accentStrong = isDark ? primaryPalette[3] : primaryPalette[6];
  const navActiveBackground = isDark ? primaryPalette[8] : primaryPalette[1];
  const navActiveText = isDark ? primaryPalette[2] : intent.primary;
  const surfaceHighlight = isDark ? primaryPalette[8] : primaryPalette[1];

  return {
    '--sl-font-family': fontFamily,
    '--sl-shell-reference-width': appShellLayoutTokens.referenceViewportWidth,
    '--sl-shell-dense-content-width': appShellLayoutTokens.denseContentWidth,
    '--sl-shell-max-width': appShellLayoutTokens.maxWidth,
    '--sl-shell-min-width': appShellLayoutTokens.minWidth,
    '--sl-shell-rail-padding': appShellLayoutTokens.railPadding,
    '--sl-shell-safe-area-inset-top': 'env(safe-area-inset-top)',
    '--sl-shell-safe-area-inset-bottom': 'env(safe-area-inset-bottom)',
    '--sl-shell-header-content-height': shell.headerHeight,
    '--sl-page-top-padding': appShellLayoutTokens.pageTopPadding,
    '--sl-page-bottom-padding': appShellLayoutTokens.pageBottomPadding,
    '--sl-page-section-gap': appShellLayoutTokens.pageSectionGap,
    '--sl-page-bottom-spacer': appShellLayoutTokens.pageBottomSpacer,
    '--sl-touch-target-min': appSizeTokens.touchTargetMin,
    '--sl-mobile-control-height': appSizeTokens.controlHeight,
    '--sl-mobile-button-height': appSizeTokens.buttonHeight,
    '--sl-shell-header-height': shell.headerHeight,
    '--sl-shell-footer-content-height': shell.bottomNavHeight,
    '--sl-focus-outline': focus.ring,
    '--sl-focus-width': focus.width,
    '--sl-focus-offset': focus.offset,
    '--sl-border-width': appBorderTokens.softWidth,
    '--sl-app-background': surface.background,
    '--sl-app-canvas-ambient-a': surface.ambientA,
    '--sl-app-canvas-ambient-b': surface.ambientB,
    '--sl-app-canvas-highlight': surface.highlight,
    '--sl-app-canvas-haze': surface.haze,
    '--sl-app-canvas-background': `linear-gradient(136deg, ${surface.highlight} 0%, transparent 44%), radial-gradient(108% 92% at 12% 10%, ${surface.ambientA} 0%, transparent 50%), radial-gradient(88% 76% at 84% 18%, ${surface.ambientB} 0%, transparent 54%), linear-gradient(180deg, ${surface.haze} 0%, transparent 62%), ${surface.background}`,
    '--sl-background-alt': surface.subtleSurface,
    '--sl-shell-background': surface.shell,
    '--sl-shell-border': border.default,
    '--sl-border-strong': border.strong,
    '--sl-accent': intent.primary,
    '--sl-accent-soft': accentSoft,
    '--sl-accent-strong': accentStrong,
    '--sl-shell-radius': `${appRadiusTokens.shell}px`,
    '--sl-section-radius': `${appRadiusTokens.section}px`,
    '--sl-control-radius': `${appRadiusTokens.control}px`,
    '--sl-control-text': text.primary,
    '--sl-text': text.primary,
    '--sl-text-secondary': text.secondary,
    '--sl-muted-text': text.secondary,
    '--sl-surface-card': surface.paper,
    '--sl-surface-raised': surface.raised,
    '--sl-surface-subtle': surface.subtleSurface,
    '--sl-surface-muted': surface.subtleSurface,
    '--sl-surface-highlight': surfaceHighlight,
    '--sl-surface-glass': surface.glass,
    '--sl-surface-glass-strong': surface.glassStrong,
    '--sl-surface-glass-border': surface.glassBorder,
    '--sl-surface-input': surface.paper,
    '--sl-surface-input-focus': surface.subtleSurface,
    '--sl-surface-input-border': border.default,
    '--sl-glass-blur': themePreference === 'dark' ? '18px' : '14px',
    '--sl-glass-shadow':
      themePreference === 'dark'
        ? '0 18px 42px rgb(2 6 23 / 0.34)'
        : '0 10px 34px rgb(148 184 255 / 0.18)',
    '--sl-shell-panel-background': `linear-gradient(180deg, ${surface.glassStrong}, ${surface.glass})`,
    '--sl-surface-input-invalid': intent.error,
    '--sl-nav-active-text': navActiveText,
    '--sl-nav-active-background': navActiveBackground,
    '--sl-button-gradient-top': `linear-gradient(180deg, ${primaryPalette[5]}, ${primaryPalette[6]})`,
    '--sl-button-gradient-bottom': `linear-gradient(180deg, ${primaryPalette[6]}, ${primaryPalette[7]})`,
    '--sl-button-text': '#ffffff',
    '--sl-button-hovered-text': '#ffffff',
    '--sl-shadow-ambient': activeTheme.shadowAmbient,
    '--sl-shadow-raised': activeTheme.shadowRaised,
    '--sl-panel-shadow': appShadowTokens.panel,
    '--sl-shell-shadow': appShadowTokens.shell,
    '--sl-control-shadow': appShadowTokens.control,
    '--sl-app-success': intent.success,
    '--sl-app-warning': intent.warning,
    '--sl-app-danger': intent.error,
    '--sl-app-info': intent.info,
    '--sl-entity-dashboard-color':
      infoPalette[themePreference === 'dark' ? 3 : 6],
    '--sl-entity-dashboard-background':
      infoPalette[themePreference === 'dark' ? 8 : 1],
    '--sl-entity-scanner-color':
      primaryPalette[themePreference === 'dark' ? 3 : 6],
    '--sl-entity-scanner-background':
      primaryPalette[themePreference === 'dark' ? 8 : 1],
    '--sl-entity-buffer-color':
      primaryPalette[themePreference === 'dark' ? 4 : 5],
    '--sl-entity-buffer-background':
      primaryPalette[themePreference === 'dark' ? 8 : 1],
    '--sl-entity-arrival-color':
      successPalette[themePreference === 'dark' ? 3 : 6],
    '--sl-entity-arrival-background':
      successPalette[themePreference === 'dark' ? 8 : 1],
    '--sl-entity-departure-color':
      errorPalette[themePreference === 'dark' ? 3 : 6],
    '--sl-entity-departure-background':
      errorPalette[themePreference === 'dark' ? 8 : 1],
    '--sl-entity-stocks-color':
      warningPalette[themePreference === 'dark' ? 3 : 6],
    '--sl-entity-stocks-background':
      warningPalette[themePreference === 'dark' ? 8 : 1],
    '--sl-entity-drafts-color': infoPalette[themePreference === 'dark' ? 3 : 6],
    '--sl-entity-drafts-background':
      infoPalette[themePreference === 'dark' ? 8 : 1],
    '--sl-entity-settings-color':
      neutralPalette[themePreference === 'dark' ? 2 : 6],
    '--sl-entity-settings-background':
      neutralPalette[themePreference === 'dark' ? 8 : 1],
    '--sl-scanner-overlay': scanner.overlay,
    '--sl-sync-offline': sync.offline,
    '--sl-sync-pending': sync.pending,
    '--sl-sync-synced': sync.synced,
    '--sl-sync-error': sync.error,
    '--duration-fast': appMotionTokens.fast,
    '--duration-base': appMotionTokens.base,
    '--duration-slow': appMotionTokens.slow,
    '--ease-standard': appMotionTokens.easeStandard,
    '--ease-enter': appMotionTokens.easeEnter,
    '--ease-exit': appMotionTokens.easeExit,
    ...brandColorShades(primaryPalette),
  };
};

export const createThemeCssVariablesResolver =
  (themePreference: ThemePreference): CSSVariablesResolver =>
  () => ({
    variables: buildThemeCssVariables(themePreference),
    light: buildThemeCssVariables(themePreference),
    dark: buildThemeCssVariables(themePreference),
  });

export const createAppTheme = (themePreference: ThemePreference) => {
  const activeTheme = themeModeConfigs[themePreference];
  const themeOverride: MantineThemeOverride = {
    respectReducedMotion: true,
    autoContrast: appThemeDefaults.autoContrast,
    luminanceThreshold: appThemeDefaults.luminanceThreshold,
    focusRing: appThemeDefaults.focusRing,
    fontFamily,
    fontFamilyMonospace,
    colors: {
      ...appColorPalettes,
      brand: virtualColor({
        name: 'brand',
        light: activeTheme.primaryColor,
        dark: activeTheme.primaryColor,
      }),
    },
    primaryColor: appThemeDefaults.primaryColor,
    primaryShade: appThemeDefaults.primaryShade,
    headings: headingTokens,
    fontSizes,
    lineHeights,
    fontWeights,
    breakpoints: {
      xs: appBreakpointTokens.largePhone,
      sm: appBreakpointTokens.tablet,
      md: appBreakpointTokens.desktop,
      lg: appBreakpointTokens.wide,
      xl: appBreakpointTokens.ultraWide,
    },
    defaultRadius: appThemeDefaults.defaultRadius,
    radius: {
      xs: '4px',
      sm: `${appRadiusTokens.control}px`,
      md: `${appRadiusTokens.control}px`,
      lg: `${appRadiusTokens.section}px`,
      xl: `${appRadiusTokens.shell}px`,
      chip: `${appRadiusTokens.chip}px`,
      pill: `${appRadiusTokens.pill}px`,
    },
    spacing: {
      xs: appSpacingTokens.xs,
      sm: appSpacingTokens.sm,
      md: appSpacingTokens.md,
      lg: appSpacingTokens.lg,
      xl: appSpacingTokens.xl,
      xxl: appSpacingTokens.xxl,
    },
    shadows: {
      xs: 'none',
      sm: appShadowTokens.control,
      md: appShadowTokens.ambient,
      lg: appShadowTokens.shell,
      xl: appShadowTokens.raised,
    },
    variantColorResolver: (input) => {
      if (input.variant === 'default' && input.color === 'warning') {
        return {
          background:
            'color-mix(in srgb, var(--sl-app-warning) 10%, var(--sl-surface-glass-strong))',
          border:
            'color-mix(in srgb, var(--sl-app-warning) 44%, var(--sl-surface-glass-border))',
          color: 'var(--sl-app-warning)',
          hover:
            'color-mix(in srgb, var(--sl-app-warning) 16%, var(--sl-surface-glass-strong))',
        };
      }

      return defaultVariantColorsResolver(input);
    },
    other: activeTheme.other,
    components: themeComponents,
  };

  return createTheme(themeOverride);
};
