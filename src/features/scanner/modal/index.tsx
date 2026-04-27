import {
  type ReactElement,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { Modal } from '@mantine/core';
import { useDebouncedValue } from '@mantine/hooks';
import { useStore } from 'zustand';

import { bufferStore } from '@/features/buffer/core/buffer-core.public.ts';
import { overlayArbitrationStore } from '@/features/navigation/model/overlay-arbitration.store.ts';
import type { ScannerSessionTab } from '@/features/scanner/runtime/model/scanner-session.types.ts';
import { scannerPreferencesStore } from '@/features/scanner/runtime/model/scanner-preferences.store.ts';
import { scannerSessionStore } from '@/features/scanner/runtime/model/scanner-session.store.ts';
import { scannerRuntimeController } from '@/features/scanner/runtime/scanner-runtime.public.ts';

import { resolveSelectedCameraId } from './helpers/resolve-selected-camera-id.ts';
import { useScannerCapabilities } from './hooks/use-scanner-capabilities.ts';
import { useScannerLiveOrchestration } from './hooks/use-scanner-live-orchestration.ts';
import { useScannerModalNotifications } from './hooks/use-scanner-modal-notifications.ts';
import { useScannerPhotoDecode } from './hooks/use-scanner-photo-decode.ts';
import { useScannerPhotoEditor } from './hooks/use-scanner-photo-editor.ts';
import { ScannerModalBody } from './sections/body.tsx';
import { ScannerModalFooter } from './sections/footer.tsx';
import { ScannerModalHeader } from './sections/header.tsx';
import { TAB_SWITCH_DEBOUNCE_MS } from './constants.ts';
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
  const {
    debouncedRefreshLiveScanner,
    resetLiveAutoStart,
    stopLiveForClose,
    throttledToggleLiveScanner,
  } = useScannerLiveOrchestration({
    activeTab,
    controller: scannerRuntimeController,
    opened,
    previewElement,
    reloadCapabilities,
    resolvedCameraId,
    scanningStatus,
    setIsOperationPending,
  });
  const handleDecodePhoto = useScannerPhotoDecode({
    activeTab,
    controller: scannerRuntimeController,
    pendingTab,
    photoAbortRef,
    photoEditor,
    photoMaxFileSizeBytes,
    resetPhotoEditor,
    selectedFile,
    setIsOperationPending,
  });
  const showLoadingOverlay =
    isOperationPending ||
    scanningStatus === 'decoding' ||
    scanningStatus === 'starting' ||
    scanningStatus === 'stopping';
  const shouldRenderInlineStatusMessage =
    statusMessage !== null &&
    scanningStatus !== 'warning' &&
    (pendingTab !== 'photo' || selectedFile === null);
  const shouldRenderSuccessState =
    scanningStatus === 'success' &&
    latestBufferItem !== null &&
    (latestBufferItem.source === 'scanner-live' ||
      latestBufferItem.source === 'scanner-photo');
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

  const handleTabChange = useCallback((nextTab: ScannerSessionTab): void => {
    setPendingTab(nextTab);
    setHasPendingUserTabSwitch(true);
    scannerSessionStore.getState().clearError();
    scannerSessionStore.getState().setStatus({
      message: null,
    });
    scannerSessionStore.getState().setScanningStatus('idle');
    scannerPreferencesStore.getState().setPreferredTab(nextTab);
  }, []);

  const handleClose = useCallback(async (): Promise<void> => {
    setIsOperationPending(true);
    photoAbortRef.current?.abort();
    resetLiveAutoStart();
    setPendingTab(preferredTab);
    resetPhotoEditor();

    try {
      await stopLiveForClose('session-close');
      scannerRuntimeController.closeSession();
    } finally {
      setIsOperationPending(false);
    }
  }, [
    photoAbortRef,
    preferredTab,
    resetLiveAutoStart,
    resetPhotoEditor,
    stopLiveForClose,
  ]);

  useEffect(() => {
    if (!opened) {
      photoAbortRef.current?.abort();
    }
  }, [opened, photoAbortRef]);

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

        <ScannerModalBody
          capabilities={capabilities}
          latestBufferItem={latestBufferItem}
          liveCameraOptions={liveCameraOptions}
          pendingTab={pendingTab}
          photoEditor={photoEditor}
          resolvedCameraId={resolvedCameraId}
          scanningStatus={scanningStatus}
          selectedFile={selectedFile}
          shouldRenderInlineStatusMessage={shouldRenderInlineStatusMessage}
          shouldRenderSuccessState={shouldRenderSuccessState}
          showLoadingOverlay={showLoadingOverlay}
          statusMessage={statusMessage}
          viewState={viewState}
          visibleErrorMessage={visibleErrorMessage}
          setPreviewElement={setPreviewElement}
          onCameraChange={(value) => {
            scannerPreferencesStore.getState().setSelectedCameraId(value);
          }}
          onDismissError={handleDismissError}
          onDropPhotoFile={applyPhotoFile}
          onPhotoEditorChange={setPhotoEditor}
          onRefreshLiveScanner={() => {
            debouncedRefreshLiveScanner();
          }}
          onTabChange={handleTabChange}
          onToggleLiveScanner={() => {
            throttledToggleLiveScanner();
          }}
        />

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
