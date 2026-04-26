import { type PropsWithChildren, type ReactElement } from 'react';
import {
  ActionIcon,
  AppShell,
  Box,
  Group,
  Indicator,
  RemoveScroll,
  Text,
} from '@mantine/core';
import { IconListCheck, IconQrcode, IconSettings } from '@tabler/icons-react';
import { useStore } from 'zustand';

import { bufferStore } from '@/features/buffer-core/model/buffer-store.ts';
import { MobileBottomNav } from '@/features/navigation/ui/mobile-bottom-nav';
import { getPreferredScannerTab } from '@/features/scanner-runtime/model/scanner-preferences.store.ts';
import { browserScannerRuntimeController } from '@/infrastructure/browser/scanner/runtime/controller.instance.ts';
import { AppLink } from '@/router';
import { useHaptics } from '@/shared/haptics';
import { useRouteMeta } from '@/shared/routing/hooks/use-route-meta.ts';
import { getEntityAccentSurfaceStyle } from '@/shared/ui/entity-icon-tones';
import { ShellInner } from '@/shared/ui/page-primitives';

import { MobileShellNetworkStatus } from './network-status';

import styles from './styles.module.css';

export function MobileShell({
  children,
}: Readonly<PropsWithChildren>): ReactElement {
  const meta = useRouteMeta();
  const isFullscreenLayout = meta?.layout?.kind === 'fullscreen';
  const totalBufferCount = useStore(bufferStore, (state) => state.items.length);
  const haptics = useHaptics();
  const footerHeight =
    'calc(var(--sl-shell-footer-content-height) + var(--sl-shell-safe-area-inset-bottom, 0px))';

  return (
    <AppShell
      className="mobile-shell"
      header={{
        height: 'var(--sl-shell-header-height)',
        offset: false,
      }}
      footer={{
        height: footerHeight,
        offset: false,
      }}
    >
      <AppShell.Header
        className={`${styles.header} mobile-shell__header ${RemoveScroll.classNames.fullWidth}`}
      >
        <ShellInner>
          <Group
            align="center"
            className={`${styles.headerContent} mobile-shell__header-content`}
            h="100%"
            justify="space-between"
            gap="xs"
            px={0}
            wrap="nowrap"
          >
            <Box
              className="mobile-shell__title-row"
              display="flex"
              flex="1 1 auto"
              miw={0}
            >
              <Text
                className="mobile-shell__title"
                fw={800}
                miw={0}
                size="sm"
                style={{ letterSpacing: '0.02em' }}
                truncate="end"
              >
                {meta?.page?.title ?? ''}
              </Text>
            </Box>
            <Group
              className="mobile-shell__utilities"
              flex="0 0 auto"
              gap={2}
              wrap="nowrap"
            >
              <MobileShellNetworkStatus />
              <ActionIcon
                aria-label="Сканер"
                className="mobile-shell__utility"
                h="var(--sl-mobile-control-height)"
                mih="var(--sl-mobile-control-height)"
                miw="var(--sl-mobile-control-height)"
                onClick={() => {
                  void haptics.trigger('tap');
                  browserScannerRuntimeController.openSession({
                    entrypoint: 'global',
                    activeTab: getPreferredScannerTab(),
                  });
                }}
                color="brand"
                size="md"
                style={getEntityAccentSurfaceStyle('scanner')}
                variant="light"
              >
                <IconQrcode size={16} stroke={1.75} />
              </ActionIcon>
              <Box
                className={`${styles.bufferIndicator} mobile-shell__buffer-indicator`}
              >
                <Indicator
                  color="brand"
                  disabled={totalBufferCount === 0}
                  label={
                    totalBufferCount > 0 ? String(totalBufferCount) : undefined
                  }
                  offset={4}
                  position="top-end"
                  size={16}
                >
                  <AppLink
                    aria-label="Буфер"
                    className="mobile-shell__utility-link"
                    routeId="root.buffer"
                    style={{ display: 'inline-flex' }}
                  >
                    <ActionIcon
                      className="mobile-shell__utility"
                      color="brand"
                      component="span"
                      h="var(--sl-mobile-control-height)"
                      mih="var(--sl-mobile-control-height)"
                      miw="var(--sl-mobile-control-height)"
                      size="md"
                      style={getEntityAccentSurfaceStyle('buffer')}
                      variant="light"
                    >
                      <IconListCheck size={16} stroke={1.75} />
                    </ActionIcon>
                  </AppLink>
                </Indicator>
              </Box>
              <AppLink
                aria-label="Настройки"
                className="mobile-shell__utility-link"
                routeId="root.settings"
                style={{ display: 'inline-flex' }}
              >
                <ActionIcon
                  className="mobile-shell__utility"
                  color="brand"
                  component="span"
                  h="var(--sl-mobile-control-height)"
                  mih="var(--sl-mobile-control-height)"
                  miw="var(--sl-mobile-control-height)"
                  size="md"
                  style={getEntityAccentSurfaceStyle('settings')}
                  variant="light"
                >
                  <IconSettings size={16} stroke={1.75} />
                </ActionIcon>
              </AppLink>
            </Group>
          </Group>
        </ShellInner>
      </AppShell.Header>

      <AppShell.Main className={`${styles.main} mobile-shell__main`}>
        {isFullscreenLayout ? (
          <Box
            className={`${styles.mainPanelFullscreen} mobile-shell__main-panel mobile-shell__main-panel--fullscreen`}
          >
            {children}
          </Box>
        ) : (
          <ShellInner>
            <Box className={`${styles.mainPanel} mobile-shell__main-panel`}>
              {children}
            </Box>
          </ShellInner>
        )}
      </AppShell.Main>

      <AppShell.Footer
        className={`${styles.footer} mobile-shell__footer ${RemoveScroll.classNames.fullWidth}`}
      >
        <ShellInner>
          <MobileBottomNav />
        </ShellInner>
      </AppShell.Footer>
    </AppShell>
  );
}
