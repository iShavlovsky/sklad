import type { Dispatch, ReactElement, SetStateAction } from 'react';
import { LoadingOverlay, Modal } from '@mantine/core';

import type {
  ScannerScanningStatus,
  ScannerSessionTab,
} from '@/features/scanner/runtime/model/scanner-session.types.ts';

import type { PhotoEditorState } from '../photo-editor.state.ts';
import type { ScannerCapabilityState } from '../types.ts';
import type {
  ScannerLatestBufferItem,
  ScannerModalViewState,
} from '../view-state.ts';

import { ScannerModalInlineState } from './inline-state.tsx';
import { ScannerModalTabs } from './tabs.tsx';

import styles from '../styles.module.css';

type ScannerModalBodyProps = {
  capabilities: ScannerCapabilityState;
  latestBufferItem: ScannerLatestBufferItem;
  liveCameraOptions: Array<{ value: string; label: string }>;
  pendingTab: ScannerSessionTab;
  photoEditor: PhotoEditorState;
  resolvedCameraId: string | null;
  scanningStatus: ScannerScanningStatus;
  selectedFile: File | null;
  shouldRenderInlineStatusMessage: boolean;
  shouldRenderSuccessState: boolean;
  showLoadingOverlay: boolean;
  statusMessage: string | null;
  viewState: ScannerModalViewState;
  visibleErrorMessage: string | null;
  setPreviewElement: (element: HTMLVideoElement | null) => void;
  onCameraChange: (value: string | null) => void;
  onDismissError: () => void;
  onDropPhotoFile: (file: File | null) => void;
  onPhotoEditorChange: Dispatch<SetStateAction<PhotoEditorState>>;
  onRefreshLiveScanner: () => void;
  onTabChange: (tab: ScannerSessionTab) => void;
  onToggleLiveScanner: () => void;
};

export function ScannerModalBody({
  capabilities,
  latestBufferItem,
  liveCameraOptions,
  pendingTab,
  photoEditor,
  resolvedCameraId,
  scanningStatus,
  selectedFile,
  shouldRenderInlineStatusMessage,
  shouldRenderSuccessState,
  showLoadingOverlay,
  statusMessage,
  viewState,
  visibleErrorMessage,
  setPreviewElement,
  onCameraChange,
  onDismissError,
  onDropPhotoFile,
  onPhotoEditorChange,
  onRefreshLiveScanner,
  onTabChange,
  onToggleLiveScanner,
}: Readonly<ScannerModalBodyProps>): ReactElement {
  return (
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
        <ScannerModalInlineState
          latestBufferItem={latestBufferItem}
          shouldRenderInlineStatusMessage={shouldRenderInlineStatusMessage}
          shouldRenderSuccessState={shouldRenderSuccessState}
          statusMessage={statusMessage}
          visibleErrorMessage={visibleErrorMessage}
          onDismissError={onDismissError}
        />

        <ScannerModalTabs
          capabilities={capabilities}
          liveCameraOptions={liveCameraOptions}
          pendingTab={pendingTab}
          photoEditor={photoEditor}
          resolvedCameraId={resolvedCameraId}
          scanningStatus={scanningStatus}
          selectedFile={selectedFile}
          viewState={viewState}
          setPreviewElement={setPreviewElement}
          onCameraChange={onCameraChange}
          onDropPhotoFile={onDropPhotoFile}
          onPhotoEditorChange={onPhotoEditorChange}
          onRefreshLiveScanner={onRefreshLiveScanner}
          onTabChange={onTabChange}
          onToggleLiveScanner={onToggleLiveScanner}
        />
      </div>
    </Modal.Body>
  );
}
