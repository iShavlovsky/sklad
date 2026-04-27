import type { ReactElement } from 'react';
import { Button, Group } from '@mantine/core';

import styles from '../styles.module.css';

type ScannerModalFooterProps = {
  pendingTab: 'live' | 'photo';
  photoFooterDisabled: boolean;
  scanningStatus: string;
  selectedFile: File | null;
  onClearPhoto: () => void;
  onClose: () => void;
  onDecodePhoto: () => void;
};

export function ScannerModalFooter({
  pendingTab,
  photoFooterDisabled,
  scanningStatus,
  selectedFile,
  onClearPhoto,
  onClose,
  onDecodePhoto,
}: Readonly<ScannerModalFooterProps>): ReactElement {
  return (
    <div
      className={`${styles.footer} scanner-modal__footer`}
      data-compact={
        pendingTab === 'photo' && selectedFile !== null ? 'true' : undefined
      }
    >
      {pendingTab === 'photo' && (
        <Group
          className={`${styles.footerActions} scanner-modal__footer-actions`}
          grow
          wrap="nowrap"
        >
          <Button
            className="scanner-modal__footer-button scanner-modal__footer-button--secondary"
            disabled={photoFooterDisabled}
            onClick={onClearPhoto}
            size={selectedFile === null ? 'md' : 'sm'}
            variant="default"
          >
            Очистить
          </Button>
          <Button
            className="scanner-modal__footer-button"
            disabled={photoFooterDisabled || scanningStatus === 'decoding'}
            onClick={onDecodePhoto}
            size={selectedFile === null ? 'md' : 'sm'}
          >
            Сканировать
          </Button>
        </Group>
      )}

      {(pendingTab !== 'photo' || selectedFile === null) && (
        <Button
          className={`${styles.closeAction} scanner-modal__close-action`}
          color="brand"
          fullWidth
          onClick={onClose}
          radius="md"
          size="md"
          variant="filled"
        >
          Закрыть
        </Button>
      )}
    </div>
  );
}
