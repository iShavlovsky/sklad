import type { Dispatch, ReactElement, SetStateAction } from 'react';
import { Tabs } from '@mantine/core';
import { IconPhoto, IconQrcode } from '@tabler/icons-react';

import type {
  ScannerScanningStatus,
  ScannerSessionTab,
} from '@/features/scanner/runtime/model/scanner-session.types.ts';

import type { PhotoEditorState } from '../photo-editor.state.ts';
import type { ScannerCapabilityState } from '../types.ts';
import type { ScannerModalViewState } from '../view-state.ts';

import { ScannerLivePanel } from './live-panel.tsx';
import { ScannerPhotoPanel } from './photo-panel.tsx';

import styles from '../styles.module.css';

type ScannerModalTabsProps = {
  capabilities: ScannerCapabilityState;
  liveCameraOptions: Array<{ value: string; label: string }>;
  pendingTab: ScannerSessionTab;
  photoEditor: PhotoEditorState;
  resolvedCameraId: string | null;
  scanningStatus: ScannerScanningStatus;
  selectedFile: File | null;
  viewState: ScannerModalViewState;
  setPreviewElement: (element: HTMLVideoElement | null) => void;
  onCameraChange: (value: string | null) => void;
  onDropPhotoFile: (file: File | null) => void;
  onPhotoEditorChange: Dispatch<SetStateAction<PhotoEditorState>>;
  onRefreshLiveScanner: () => void;
  onTabChange: (tab: ScannerSessionTab) => void;
  onToggleLiveScanner: () => void;
};

export function ScannerModalTabs({
  capabilities,
  liveCameraOptions,
  pendingTab,
  photoEditor,
  resolvedCameraId,
  scanningStatus,
  selectedFile,
  viewState,
  setPreviewElement,
  onCameraChange,
  onDropPhotoFile,
  onPhotoEditorChange,
  onRefreshLiveScanner,
  onTabChange,
  onToggleLiveScanner,
}: Readonly<ScannerModalTabsProps>): ReactElement {
  return (
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

        onTabChange(value as ScannerSessionTab);
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
          onCameraChange={onCameraChange}
          onRefresh={onRefreshLiveScanner}
          onToggleLive={onToggleLiveScanner}
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
          acceptedMimeTypes={capabilities.photo?.acceptedMimeTypes ?? null}
          maxFileSizeBytes={capabilities.photo?.maxFileSizeBytes ?? null}
          photoEditor={photoEditor}
          selectedFile={selectedFile}
          onDropFile={onDropPhotoFile}
          onFileChange={onDropPhotoFile}
          onPhotoEditorChange={onPhotoEditorChange}
        />
      </Tabs.Panel>
    </Tabs>
  );
}
