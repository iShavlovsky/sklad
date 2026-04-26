import { type ReactElement } from 'react';
import { Modal } from '@mantine/core';

import type { DepartureRecord } from '@/domain/entries/departure.record.ts';

import { DepartureEditorForm } from './departure-editor-form.tsx';

interface DepartureFormModalProps {
  onClose: () => void;
  onCreated: (record: DepartureRecord) => void;
  opened: boolean;
}

export function DepartureFormModal({
  onClose,
  onCreated,
  opened,
}: Readonly<DepartureFormModalProps>): ReactElement {
  return (
    <Modal
      centered
      fullScreen
      onClose={onClose}
      opened={opened}
      title="Новый расход"
    >
      {opened && (
        <DepartureEditorForm onCancel={onClose} onCreated={onCreated} />
      )}
    </Modal>
  );
}
