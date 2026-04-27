import type { ReactElement } from 'react';
import {
  ActionIcon,
  Button,
  Paper,
  Select,
  Stack,
  Text,
  ThemeIcon,
} from '@mantine/core';
import {
  IconAlertCircle,
  IconPlayerPause,
  IconPlayerPlay,
  IconRadar2,
  IconRefresh,
} from '@tabler/icons-react';

import type { ScannerScanningStatus } from '@/features/scanner/runtime/model/scanner-session.types.ts';

import styles from '../styles.module.css';

type ScannerLivePanelProps = {
  cameraPlaceholder: string;
  liveActionLabel: string;
  liveCameraOptions: Array<{ value: string; label: string }>;
  resolvedCameraId: string | null;
  scanningStatus: ScannerScanningStatus;
  setPreviewElement: (element: HTMLVideoElement | null) => void;
  showLivePermissionPlaceholder: boolean;
  onCameraChange: (value: string | null) => void;
  onRefresh: () => void;
  onToggleLive: () => void;
};

export function ScannerLivePanel({
  cameraPlaceholder,
  liveActionLabel,
  liveCameraOptions,
  resolvedCameraId,
  scanningStatus,
  setPreviewElement,
  showLivePermissionPlaceholder,
  onCameraChange,
  onRefresh,
  onToggleLive,
}: Readonly<ScannerLivePanelProps>): ReactElement {
  const livePlaceholder = resolveLivePlaceholder(
    scanningStatus,
    showLivePermissionPlaceholder,
    onRefresh
  );
  const liveActionTone = resolveLiveActionTone(scanningStatus);

  return (
    <div className={`${styles.livePanel} scanner-modal__live-panel`}>
      <div className={`${styles.controlsRow} scanner-modal__controls-row`}>
        <Select
          aria-label="Выбор камеры"
          className={`${styles.cameraSelect} scanner-modal__camera-select`}
          data={liveCameraOptions}
          disabled={liveCameraOptions.length <= 1}
          placeholder={cameraPlaceholder}
          value={resolvedCameraId}
          onChange={onCameraChange}
        />
        <ActionIcon
          aria-label="Обновить камеры"
          className={styles.refreshAction}
          color="brand"
          onClick={onRefresh}
          size="lg"
          variant="light"
        >
          <IconRefresh size={16} stroke={1.8} />
        </ActionIcon>
      </div>

      <Paper
        className={`scanner-reader ${styles.reader} scanner-modal__reader`}
        component="div"
        radius="md"
        withBorder
      >
        <video
          aria-label="Предпросмотр камеры"
          className={`${styles.readerVideo} scanner-reader__video`}
          muted
          playsInline
          ref={setPreviewElement}
        />

        {!showLivePermissionPlaceholder && (
          <button
            aria-label={`Камера: ${liveActionLabel}`}
            className={`${styles.readerOverlay} scanner-reader__tap-target`}
            type="button"
            onClick={onToggleLive}
          >
            <span className={styles.readerOverlayChrome}>
              <span
                className={styles.readerOverlayStatus}
                data-tone={liveActionTone}
              >
                {renderLiveActionIcon(scanningStatus)}
                <span className={styles.readerOverlayStatusLabel}>
                  {`Камера · ${liveActionLabel}`}
                </span>
              </span>
            </span>

            {scanningStatus !== 'active' && scanningStatus !== 'starting' && (
              <span className={styles.readerOverlayHint}>
                Нажмите по области сканирования, чтобы{' '}
                {liveActionLabel.toLowerCase()}
              </span>
            )}
          </button>
        )}

        {livePlaceholder}
      </Paper>
    </div>
  );
}

function renderLiveActionIcon(
  scanningStatus: ScannerScanningStatus
): ReactElement {
  if (scanningStatus === 'active' || scanningStatus === 'starting') {
    return <IconPlayerPause size={18} stroke={1.8} />;
  }

  return <IconPlayerPlay size={18} stroke={1.8} />;
}

function resolveLiveActionTone(
  scanningStatus: ScannerScanningStatus
): 'green' | 'yellow' {
  return scanningStatus === 'active' || scanningStatus === 'starting'
    ? 'yellow'
    : 'green';
}

function resolveLivePlaceholder(
  scanningStatus: ScannerScanningStatus,
  showLivePermissionPlaceholder: boolean,
  onRefresh: () => void
): ReactElement | null {
  if (showLivePermissionPlaceholder) {
    return (
      <Paper
        className={`${styles.readerPlaceholder} ${styles.readerPlaceholderError} scanner-reader__placeholder scanner-reader__placeholder--error`}
        component="div"
        p="xl"
        radius={0}
      >
        <Stack align="center" gap={8} justify="center">
          <ThemeIcon color="red" radius="xl" size={42} variant="light">
            <IconAlertCircle size={22} stroke={1.8} />
          </ThemeIcon>
          <Text fw={700} size="sm" ta="center">
            Нет доступа к камере
          </Text>
          <Text c="dimmed" size="xs" ta="center">
            Повторите запрос и разрешите доступ в браузере. Обычно это делается
            через иконку камеры в адресной строке или в настройках сайта.
          </Text>
          <div className="state-placeholder__action">
            <Button onClick={onRefresh} size="sm" variant="light">
              Повторить запрос
            </Button>
          </div>
        </Stack>
      </Paper>
    );
  }

  if (scanningStatus === 'active' || scanningStatus === 'starting') {
    return null;
  }

  return (
    <div
      aria-hidden="true"
      className={`${styles.readerPlaceholder} ${styles.readerPlaceholderPassive} scanner-reader__placeholder`}
    >
      <ThemeIcon color="brand" radius="xl" size={42} variant="light">
        <IconRadar2 size={22} stroke={1.8} />
      </ThemeIcon>
    </div>
  );
}
