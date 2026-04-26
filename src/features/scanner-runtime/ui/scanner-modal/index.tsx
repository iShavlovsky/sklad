import {
  type ReactElement,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  Button,
  LoadingOverlay,
  Modal,
  Paper,
  Tabs,
  Text,
} from '@mantine/core';
import {
  useDebouncedCallback,
  useDebouncedValue,
  useThrottledCallback,
} from '@mantine/hooks';
import { IconPhoto, IconQrcode } from '@tabler/icons-react';
import { useStore } from 'zustand';

import { bufferStore } from '@/features/buffer-core/model/buffer-store.ts';
import { overlayArbitrationStore } from '@/features/navigation/model/overlay-arbitration.store.ts';
import { scannerPreferencesStore } from '@/features/scanner-runtime/model/scanner-preferences.store.ts';
import { scannerSessionStore } from '@/features/scanner-runtime/model/scanner-session.store.ts';
import { browserScannerRuntimeController as scannerRuntimeController } from '@/infrastructure/browser/scanner/runtime/controller.instance.ts';
import { createCroppedImageFile as createCroppedScannerFile } from '@/shared/lib/media/image-transform.ts';

import { resolveSelectedCameraId } from './helpers/resolve-selected-camera-id.ts';
import { useScannerCapabilities } from './hooks/use-scanner-capabilities.ts';
import { useScannerModalNotifications } from './hooks/use-scanner-modal-notifications.ts';
import { useScannerPhotoEditor } from './hooks/use-scanner-photo-editor.ts';
import { ScannerModalFooter } from './sections/footer.tsx';
import { ScannerModalHeader } from './sections/header.tsx';
import { ScannerLivePanel } from './sections/live-panel.tsx';
import { ScannerPhotoPanel } from './sections/photo-panel.tsx';
import {
  LIVE_REFRESH_DEBOUNCE_MS,
  LIVE_TOGGLE_THROTTLE_MS,
  TAB_SWITCH_DEBOUNCE_MS,
} from './constants.ts';
import {
  getScannerErrorMessage,
  shouldDisplayScannerError,
} from './error-presentation.ts';
import { resolveScannerModalViewState } from './view-state.ts';

import 'react-easy-crop/react-easy-crop.css';
import styles from './styles.module.css';

export function ScannerModal(): ReactElement {
  const preferredTab = useStore(
    scannerPreferencesStore,
    (state) => state.preferredTab
  );
  const selectedCameraId = useStore(
    scannerPreferencesStore,
    (state) => state.selectedCameraId
  );
  const activeTab = useStore(scannerSessionStore, (state) => state.activeTab);
  const errorCode = useStore(scannerSessionStore, (state) => state.errorCode);
  const errorMessage = useStore(
    scannerSessionStore,
    (state) => state.errorMessage
  );
  const isOpen = useStore(scannerSessionStore, (state) => state.isOpen);
  const permissionStatus = useStore(
    scannerSessionStore,
    (state) => state.permissionStatus
  );
  const scanningStatus = useStore(
    scannerSessionStore,
    (state) => state.scanningStatus
  );
  const selectedFile = useStore(
    scannerSessionStore,
    (state) => state.selectedFile
  );
  const statusMessage = useStore(
    scannerSessionStore,
    (state) => state.statusMessage
  );
  const currentOverlay = useStore(
    overlayArbitrationStore,
    (state) => state.currentOverlay
  );
  const latestBufferItem = useStore(
    bufferStore,
    (state) => state.items.at(-1) ?? null
  );

  const [previewElement, setPreviewElement] = useState<HTMLVideoElement | null>(
    null
  );
  const [pendingTab, setPendingTab] = useState<'live' | 'photo'>(activeTab);
  const [hasPendingUserTabSwitch, setHasPendingUserTabSwitch] = useState(false);
  const [isOperationPending, setIsOperationPending] = useState(false);
  const [debouncedTab] = useDebouncedValue(pendingTab, TAB_SWITCH_DEBOUNCE_MS);

  const { capabilities, reloadCapabilities } = useScannerCapabilities(
    scannerRuntimeController,
    isOpen
  );
  const {
    applyPhotoFile,
    photoAbortRef,
    photoEditor,
    resetPhotoEditor,
    setPhotoEditor,
  } = useScannerPhotoEditor(scannerRuntimeController);

  const liveAutoStartedRef = useRef(false);
  const liveRefreshInFlightRef = useRef(false);
  const liveToggleInFlightRef = useRef(false);
  const previousTabRef = useRef(activeTab);

  const opened =
    isOpen &&
    currentOverlay?.id === 'scanner-session' &&
    currentOverlay.kind === 'modal';
  const visibleTab = opened ? pendingTab : activeTab;
  const visibleErrorMessage = shouldDisplayScannerError(visibleTab, errorCode)
    ? getScannerErrorMessage(errorCode)
    : null;
  const liveCameraOptions = useMemo(
    () =>
      capabilities.live?.availableCameras.map((camera) => ({
        value: camera.deviceId,
        label: camera.label,
      })) ?? [],
    [capabilities.live]
  );
  const resolvedCameraId = resolveSelectedCameraId(
    liveCameraOptions,
    selectedCameraId
  );
  const photoMaxFileSizeBytes = capabilities.photo?.maxFileSizeBytes ?? null;
  const showLoadingOverlay =
    isOperationPending ||
    scanningStatus === 'decoding' ||
    scanningStatus === 'starting' ||
    scanningStatus === 'stopping';
  const shouldRenderInlineStatusMessage =
    statusMessage !== null &&
    scanningStatus !== 'warning' &&
    (pendingTab !== 'photo' || selectedFile === null);
  const viewState = resolveScannerModalViewState({
    activeTab: visibleTab,
    hasAvailableCameras: liveCameraOptions.length > 0,
    latestBufferItem,
    liveSupported: capabilities.live?.supported ?? null,
    permissionStatus,
    photoEditorObjectUrl: photoEditor.objectUrl,
    scanningStatus,
    selectedFile,
    visibleErrorMessage,
  });

  useScannerModalNotifications({
    clearError: () => {
      scannerSessionStore.getState().clearError();
    },
    errorCode,
    errorMessage,
    latestBufferItem,
    opened,
    scanningStatus,
    statusMessage,
    visibleTab,
  });

  useEffect(() => {
    if (!opened || !hasPendingUserTabSwitch || debouncedTab === activeTab) {
      return;
    }

    scannerRuntimeController.switchTab(debouncedTab);
  }, [activeTab, debouncedTab, hasPendingUserTabSwitch, opened]);

  useEffect(() => {
    if (!opened) {
      return;
    }

    queueMicrotask(() => {
      setPendingTab(activeTab);
      setHasPendingUserTabSwitch(false);
    });
  }, [activeTab, opened]);

  const handleDismissError = useCallback((): void => {
    scannerSessionStore.getState().clearError();
  }, []);

  const handleClose = useCallback(async (): Promise<void> => {
    setIsOperationPending(true);
    photoAbortRef.current?.abort();
    liveAutoStartedRef.current = false;
    setPendingTab(preferredTab);
    resetPhotoEditor();

    try {
      await scannerRuntimeController.stopLiveScan('session-close');
      scannerRuntimeController.closeSession();
    } finally {
      setIsOperationPending(false);
    }
  }, [photoAbortRef, preferredTab, resetPhotoEditor]);

  const handleRetryLiveScan = useCallback(async (): Promise<void> => {
    if (previewElement === null) {
      return;
    }

    liveAutoStartedRef.current = true;
    setIsOperationPending(true);

    try {
      await scannerRuntimeController.stopLiveScan('caller');
      await scannerRuntimeController.startLiveScan({
        deviceId: resolvedCameraId,
        previewElement,
      });
    } finally {
      setIsOperationPending(false);
    }
  }, [previewElement, resolvedCameraId]);

  const handleRefreshLiveScanner = useCallback(async (): Promise<void> => {
    if (liveRefreshInFlightRef.current) {
      return;
    }

    liveRefreshInFlightRef.current = true;
    setIsOperationPending(true);

    try {
      await reloadCapabilities();

      if (activeTab === 'live' && previewElement !== null) {
        await handleRetryLiveScan();
      }
    } finally {
      liveRefreshInFlightRef.current = false;
      setIsOperationPending(false);
    }
  }, [activeTab, handleRetryLiveScan, previewElement, reloadCapabilities]);

  const debouncedRefreshLiveScanner = useDebouncedCallback(() => {
    void handleRefreshLiveScanner();
  }, LIVE_REFRESH_DEBOUNCE_MS);

  const throttledToggleLiveScanner = useThrottledCallback(() => {
    if (liveToggleInFlightRef.current) {
      return;
    }

    liveToggleInFlightRef.current = true;

    const releaseLock = (): void => {
      liveToggleInFlightRef.current = false;
    };

    if (scanningStatus === 'starting' || scanningStatus === 'stopping') {
      releaseLock();
      return;
    }

    if (scanningStatus === 'active') {
      void scannerRuntimeController.stopLiveScan('caller').finally(releaseLock);
      return;
    }

    void handleRetryLiveScan().finally(releaseLock);
  }, LIVE_TOGGLE_THROTTLE_MS);

  const handleDecodePhoto = useCallback(async (): Promise<void> => {
    if (selectedFile === null || photoEditor.objectUrl === null) {
      return;
    }

    if (
      photoMaxFileSizeBytes !== null &&
      selectedFile.size > photoMaxFileSizeBytes
    ) {
      resetPhotoEditor();
      scannerRuntimeController.reportFileSelection({
        status: 'rejected-too-large',
        message:
          getScannerErrorMessage('file-too-large') ??
          'Файл превышает допустимый размер для фото-сканирования.',
      });
      return;
    }

    if (pendingTab === 'photo' && activeTab !== 'photo') {
      scannerRuntimeController.switchTab('photo');
    }

    const abortController = new AbortController();
    photoAbortRef.current?.abort();
    photoAbortRef.current = abortController;
    setIsOperationPending(true);

    try {
      const fileForDecode =
        photoEditor.croppedAreaPixels === null
          ? selectedFile
          : await createCroppedScannerFile({
              crop: photoEditor.croppedAreaPixels,
              fileName: selectedFile.name,
              flipX: photoEditor.flipX,
              flipY: photoEditor.flipY,
              imageUrl: photoEditor.objectUrl,
              mimeType:
                selectedFile.type.trim().length > 0
                  ? selectedFile.type
                  : 'image/png',
              rotation: photoEditor.rotation,
            });

      await scannerRuntimeController.decodePhotoFile({
        file: fileForDecode,
        signal: abortController.signal,
      });
    } finally {
      setIsOperationPending(false);
    }
  }, [
    activeTab,
    pendingTab,
    photoAbortRef,
    photoEditor,
    photoMaxFileSizeBytes,
    resetPhotoEditor,
    selectedFile,
  ]);

  useEffect(() => {
    if (!opened) {
      photoAbortRef.current?.abort();
      liveAutoStartedRef.current = false;
      void scannerRuntimeController.stopLiveScan('session-close');
    }
  }, [opened, photoAbortRef]);

  useEffect(() => {
    const previousTab = previousTabRef.current;
    previousTabRef.current = activeTab;

    if (!opened) {
      return;
    }

    if (previousTab === 'live' && activeTab === 'photo') {
      liveAutoStartedRef.current = false;
      void scannerRuntimeController.stopLiveScan('tab-switch');
      return;
    }

    if (
      activeTab === 'live' &&
      previousTab !== 'live' &&
      previewElement !== null &&
      !liveAutoStartedRef.current
    ) {
      liveAutoStartedRef.current = true;
      void scannerRuntimeController.startLiveScan({
        deviceId: resolvedCameraId,
        previewElement,
      });
    }
  }, [activeTab, opened, previewElement, resolvedCameraId]);

  useEffect(() => {
    if (
      !opened ||
      activeTab !== 'live' ||
      previewElement === null ||
      liveAutoStartedRef.current
    ) {
      return;
    }

    liveAutoStartedRef.current = true;
    void scannerRuntimeController.startLiveScan({
      deviceId: resolvedCameraId,
      previewElement,
    });
  }, [activeTab, opened, previewElement, resolvedCameraId]);

  return (
    <Modal.Root
      centered={false}
      className="scanner-modal-root"
      fullScreen
      lockScroll={false}
      onClose={() => {
        void handleClose();
      }}
      opened={opened}
      transitionProps={{ duration: 160, transition: 'fade' }}
    >
      <Modal.Overlay />
      <Modal.Content
        className={`${styles.modal} scanner-modal`}
        radius={0}
        style={{
          display: 'flex',
          flex: '1 1 auto',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        <ScannerModalHeader
          permissionStatus={permissionStatus}
          scanningStatus={scanningStatus}
          onClose={() => {
            void handleClose();
          }}
        />

        <Modal.Body
          className={`${styles.body} scanner-modal__body`}
          p="xs"
          style={{
            display: 'flex',
            flex: '1 1 auto',
            minHeight: 0,
            overflow: 'hidden',
            position: 'relative',
          }}
        >
          <LoadingOverlay
            visible={showLoadingOverlay}
            zIndex={2}
            overlayProps={{ blur: 1.5, radius: 'sm' }}
            loaderProps={{ color: 'brand', type: 'dots' }}
          />
          <div className={`${styles.layout} scanner-modal__layout`}>
            {visibleErrorMessage && (
              <Paper
                className={`${styles.inlineState} scanner-modal__inline-state scanner-modal__inline-state--error`}
                component="div"
                data-tone="error"
                p="xs"
                radius="md"
                withBorder
              >
                <div>
                  <Text fw={700} size="sm">
                    {visibleErrorMessage}
                  </Text>
                </div>
                <Button
                  color="red"
                  onClick={handleDismissError}
                  size="compact-xs"
                  variant="subtle"
                >
                  Закрыть предупреждение
                </Button>
              </Paper>
            )}

            {scanningStatus === 'success' &&
              latestBufferItem !== null &&
              (latestBufferItem.source === 'scanner-live' ||
                latestBufferItem.source === 'scanner-photo') && (
                <Paper
                  className={`${styles.inlineState} scanner-modal__inline-state scanner-modal__inline-state--success`}
                  component="div"
                  data-tone="success"
                  p="xs"
                  radius="md"
                  withBorder
                >
                  <div>
                    <Text fw={700} size="sm">
                      Код добавлен в буфер
                    </Text>
                    <Text size="sm">{latestBufferItem.value}</Text>
                  </div>
                </Paper>
              )}

            {shouldRenderInlineStatusMessage && (
              <Text
                className={`${styles.statusMessage} scanner-modal__status-message`}
                size="sm"
              >
                {statusMessage}
              </Text>
            )}

            <Tabs
              className="scanner-modal__tabs"
              classNames={{
                list: styles.tabsList,
                panel: styles.tabsPanel,
                root: styles.tabsRoot,
                tab: styles.tab,
              }}
              keepMounted
              variant="unstyled"
              style={{
                display: 'flex',
                flex: '1 1 auto',
                flexDirection: 'column',
                minHeight: 0,
              }}
              value={pendingTab}
              onChange={(value) => {
                if (value === null || value === pendingTab) {
                  return;
                }

                const nextTab = value as 'live' | 'photo';
                setPendingTab(nextTab);
                setHasPendingUserTabSwitch(true);
                scannerSessionStore.getState().clearError();
                scannerSessionStore.getState().setStatus({
                  message: null,
                });
                scannerSessionStore.getState().setScanningStatus('idle');
                scannerPreferencesStore.getState().setPreferredTab(nextTab);
              }}
            >
              <Tabs.List
                className="scanner-modal__tabs-list"
                grow
                style={{ flex: '0 0 auto' }}
              >
                <Tabs.Tab
                  aria-label="Сканер"
                  className="scanner-modal__tab"
                  leftSection={<IconQrcode size={16} />}
                  value="live"
                >
                  Сканер
                </Tabs.Tab>
                <Tabs.Tab
                  aria-label="Файл"
                  className="scanner-modal__tab"
                  leftSection={<IconPhoto size={16} />}
                  value="photo"
                >
                  Файл
                </Tabs.Tab>
              </Tabs.List>

              <Tabs.Panel
                className="scanner-modal__tabs-panel"
                style={{
                  display: 'flex',
                  flex: '1 1 auto',
                  minHeight: 0,
                  overflow: 'hidden',
                }}
                value="live"
              >
                <ScannerLivePanel
                  cameraPlaceholder={viewState.cameraPlaceholder}
                  liveActionLabel={viewState.liveActionLabel}
                  liveCameraOptions={liveCameraOptions}
                  resolvedCameraId={resolvedCameraId}
                  scanningStatus={scanningStatus}
                  setPreviewElement={setPreviewElement}
                  showLivePermissionPlaceholder={
                    viewState.showLivePermissionPlaceholder
                  }
                  onCameraChange={(value) => {
                    scannerPreferencesStore
                      .getState()
                      .setSelectedCameraId(value);
                  }}
                  onRefresh={() => {
                    debouncedRefreshLiveScanner();
                  }}
                  onToggleLive={() => {
                    throttledToggleLiveScanner();
                  }}
                />
              </Tabs.Panel>

              <Tabs.Panel
                className="scanner-modal__tabs-panel"
                style={{
                  display: 'flex',
                  flex: '1 1 auto',
                  minHeight: 0,
                  overflow: 'hidden',
                }}
                value="photo"
              >
                <ScannerPhotoPanel
                  acceptedMimeTypes={
                    capabilities.photo?.acceptedMimeTypes ?? null
                  }
                  maxFileSizeBytes={
                    capabilities.photo?.maxFileSizeBytes ?? null
                  }
                  photoEditor={photoEditor}
                  selectedFile={selectedFile}
                  onDropFile={applyPhotoFile}
                  onFileChange={applyPhotoFile}
                  onPhotoEditorChange={setPhotoEditor}
                />
              </Tabs.Panel>
            </Tabs>
          </div>
        </Modal.Body>

        <ScannerModalFooter
          pendingTab={pendingTab}
          photoFooterDisabled={viewState.photoFooterDisabled}
          scanningStatus={scanningStatus}
          selectedFile={selectedFile}
          onClearPhoto={() => {
            handleDismissError();
            applyPhotoFile(null);
          }}
          onClose={() => {
            void handleClose();
          }}
          onDecodePhoto={() => {
            void handleDecodePhoto();
          }}
        />
      </Modal.Content>
    </Modal.Root>
  );
}
