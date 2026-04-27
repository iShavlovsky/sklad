import type { ReactElement } from 'react';
import { Group, Modal, Paper, Text, ThemeIcon } from '@mantine/core';

import type {
  ScannerPermissionStatus,
  ScannerScanningStatus,
} from '@/features/scanner/runtime/model/scanner-session.types.ts';

import {
  getPermissionTone,
  getScannerPermissionLabel,
  getScannerScanningLabel,
  getScanningTone,
} from '../status-presentation.tsx';

import styles from '../styles.module.css';

type ScannerModalHeaderProps = {
  onClose: () => void;
  permissionStatus: ScannerPermissionStatus;
  scanningStatus: ScannerScanningStatus;
};

export function ScannerModalHeader({
  onClose,
  permissionStatus,
  scanningStatus,
}: Readonly<ScannerModalHeaderProps>): ReactElement {
  const statusItems = [
    {
      key: 'permission',
      label: getScannerPermissionLabel(permissionStatus),
      tone: getPermissionTone(permissionStatus),
    },
    {
      key: 'status',
      label: getScannerScanningLabel(scanningStatus),
      tone: getScanningTone(scanningStatus),
    },
  ];

  return (
    <Modal.Header className={`${styles.header} scanner-modal__header`}>
      <Modal.Title className={styles.srOnlyTitle}>Сканер</Modal.Title>

      <div className={`${styles.headerStatus} scanner-modal__header-status`}>
        <Group
          className={`${styles.statusGroup} scanner-modal__status-group`}
          gap={6}
          grow
          wrap="nowrap"
        >
          {statusItems.map((item) => (
            <Paper
              className={`${styles.statusPill} scanner-modal__status-pill`}
              component="div"
              data-tone={item.tone.color}
              key={item.key}
              p={3}
              radius="pill"
              style={{
                background: 'var(--scanner-status-background)',
                borderColor: 'var(--scanner-status-border)',
                color: 'var(--scanner-status-color)',
              }}
              withBorder
            >
              <Group
                className={`${styles.statusPillInner} scanner-modal__status-pill-inner`}
                gap={4}
                wrap="nowrap"
              >
                <ThemeIcon
                  color={item.tone.color}
                  radius="xl"
                  size={18}
                  variant="light"
                >
                  {item.tone.icon}
                </ThemeIcon>
                <Text
                  c="inherit"
                  className={`${styles.statusPillLabel} scanner-modal__status-pill-label`}
                  fw={700}
                  size="xs"
                >
                  {item.label}
                </Text>
              </Group>
            </Paper>
          ))}
        </Group>
      </div>

      <Modal.CloseButton
        className={`${styles.closeIcon} scanner-modal__close-icon`}
        onClick={onClose}
      />
    </Modal.Header>
  );
}
