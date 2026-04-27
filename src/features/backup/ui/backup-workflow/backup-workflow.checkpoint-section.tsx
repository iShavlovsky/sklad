import type { ReactElement } from 'react';
import { Button, Stack, Text, TextInput } from '@mantine/core';

import { InfoAction } from '@/shared/ui/info-action';
import { PageSection } from '@/shared/ui/page-section';

type BackupWorkflowCheckpointSectionProps = {
  checkpointLabel: string;
  isCreating: boolean;
  onCheckpointLabelChange: (value: string) => void;
  onCreateCheckpoint: () => void;
};

export function BackupWorkflowCheckpointSection({
  checkpointLabel,
  isCreating,
  onCheckpointLabelChange,
  onCreateCheckpoint,
}: Readonly<BackupWorkflowCheckpointSectionProps>): ReactElement {
  return (
    <PageSection
      badge="Checkpoint"
      trailing={
        <InfoAction description="Checkpoint сохраняет текущий backup payload внутри IndexedDB. Это внутренняя точка восстановления перед рискованными действиями; файл на устройство не скачивается." />
      }
    >
      <Stack gap="sm">
        <TextInput
          label="Название"
          value={checkpointLabel}
          onChange={(event) => {
            onCheckpointLabelChange(event.currentTarget.value);
          }}
        />
        <Button fullWidth loading={isCreating} onClick={onCreateCheckpoint}>
          Сохранить checkpoint
        </Button>
        <Text c="dimmed" size="xs">
          Snapshot создается из текущего backup payload и отображается в общем
          timeline как checkpoint, а не как export.
        </Text>
      </Stack>
    </PageSection>
  );
}
