import type {
  ScannerPermissionStatus,
  ScannerScanningStatus,
  ScannerSessionTab,
} from '@/features/scanner/runtime/model/scanner-session.types.ts';

export type ScannerLatestBufferItem = {
  value: string;
  source?: string;
} | null;

export type ScannerModalViewStateInput = {
  activeTab: ScannerSessionTab;
  hasAvailableCameras: boolean;
  latestBufferItem: ScannerLatestBufferItem;
  liveSupported: boolean | null;
  permissionStatus: ScannerPermissionStatus;
  photoEditorObjectUrl: string | null;
  scanningStatus: ScannerScanningStatus;
  selectedFile: File | null;
  visibleErrorMessage: string | null;
};

export type ScannerModalViewState = {
  cameraPlaceholder: string;
  liveActionLabel: string;
  photoFooterDisabled: boolean;
  showLivePermissionPlaceholder: boolean;
  showSuccessState: boolean;
};

const CAMERA_PLACEHOLDER_BY_STATE = {
  empty: 'Камеры не найдены',
  ready: 'Камера выбрана',
} as const;

const LIVE_ACTION_LABEL_BY_STATUS: Partial<
  Record<ScannerScanningStatus, string>
> = {
  active: 'Пауза',
  starting: 'Пауза',
};

export function resolveScannerModalViewState(
  input: ScannerModalViewStateInput
): ScannerModalViewState {
  return {
    cameraPlaceholder: input.hasAvailableCameras
      ? CAMERA_PLACEHOLDER_BY_STATE.ready
      : CAMERA_PLACEHOLDER_BY_STATE.empty,
    liveActionLabel:
      LIVE_ACTION_LABEL_BY_STATUS[input.scanningStatus] ?? 'Запустить',
    photoFooterDisabled:
      input.selectedFile === null || input.photoEditorObjectUrl === null,
    showLivePermissionPlaceholder: shouldShowLivePermissionPlaceholder(
      input.activeTab,
      input.permissionStatus,
      input.liveSupported
    ),
    showSuccessState: shouldShowScannerSuccessState(
      input.visibleErrorMessage,
      input.scanningStatus,
      input.latestBufferItem
    ),
  };
}

function shouldShowLivePermissionPlaceholder(
  activeTab: ScannerSessionTab,
  permissionStatus: ScannerPermissionStatus,
  liveSupported: boolean | null
): boolean {
  return (
    activeTab === 'live' &&
    (permissionStatus === 'denied' ||
      permissionStatus === 'unavailable' ||
      liveSupported === false)
  );
}

function shouldShowScannerSuccessState(
  visibleErrorMessage: string | null,
  scanningStatus: ScannerScanningStatus,
  latestBufferItem: ScannerLatestBufferItem
): boolean {
  return (
    visibleErrorMessage === null &&
    scanningStatus === 'success' &&
    latestBufferItem !== null &&
    (latestBufferItem.source === 'scanner-live' ||
      latestBufferItem.source === 'scanner-photo')
  );
}
