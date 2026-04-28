import { type ReactElement, useMemo } from 'react';
import { RouterProvider } from 'react-router-dom';
import { MantineProvider } from '@mantine/core';
import { Notifications } from '@mantine/notifications';

import { createAppTheme, createThemeCssVariablesResolver } from '@/app/theme';
import { GoogleAccountConnectionProvider } from '@/features/google/ui/google-account-connection-provider';
import { PwaStatusBanner } from '@/features/pwa/ui/pwa-status-banner';
import { useUiSettings } from '@/features/settings/model/use-ui-settings';
import { appRouter } from '@/router';
import { HapticsProvider } from '@/shared/haptics';

import '@mantine/core/styles.css';
import '@mantine/dates/styles.css';
import '@mantine/dropzone/styles.css';
import '@mantine/notifications/styles.css';
import styles from './app-providers.module.css';

export function AppProviders(): ReactElement {
  const { settings } = useUiSettings();
  const resolvedColorScheme = settings.themePreference;
  const appTheme = useMemo(
    () => createAppTheme(resolvedColorScheme),
    [resolvedColorScheme]
  );
  const themeResolver = useMemo(
    () => createThemeCssVariablesResolver(resolvedColorScheme),
    [resolvedColorScheme]
  );

  return (
    <HapticsProvider>
      <MantineProvider
        defaultColorScheme={resolvedColorScheme}
        forceColorScheme={resolvedColorScheme}
        theme={appTheme}
        cssVariablesResolver={themeResolver}
      >
        <GoogleAccountConnectionProvider>
          <Notifications
            classNames={{
              root: styles.notificationsRoot,
            }}
            containerWidth="min(clamp(18rem, calc(50vw - 0.75rem), calc(26.75rem - 1.5rem)), calc(100vw - 1.5rem))"
            position="top-right"
          />
          <RouterProvider router={appRouter} />
          <PwaStatusBanner />
        </GoogleAccountConnectionProvider>
      </MantineProvider>
    </HapticsProvider>
  );
}
