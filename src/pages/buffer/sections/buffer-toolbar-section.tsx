import type { ReactElement } from 'react';
import { Alert } from '@mantine/core';
import { IconAlertCircle } from '@tabler/icons-react';

interface BufferToolbarSectionProps {
  manageLeaseConflict: string | null;
}

export function BufferToolbarSection({
  manageLeaseConflict,
}: Readonly<BufferToolbarSectionProps>): ReactElement | null {
  if (!manageLeaseConflict) {
    return null;
  }

  return (
    <Alert
      className="page-section"
      color="yellow"
      icon={<IconAlertCircle size={16} />}
      title="Буфер занят"
      variant="light"
    >
      {manageLeaseConflict}
    </Alert>
  );
}
