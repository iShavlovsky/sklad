import type { ReactElement } from 'react';
import { Button, FileInput, Group, Radio, Stack, Text } from '@mantine/core';

import type {
  BackupImportValidationResult,
  BackupRestoreMode,
} from '@/domain/backup';
import { PageSection } from '@/shared/ui/page-section';

import { restoreModes, summarizeValidation } from './backup-workflow.model.ts';

type BackupWorkflowExportRestoreSectionProps = {
  isRestoreDisabled: boolean;
  pendingAction: string | null;
  restoreMode: BackupRestoreMode;
  selectedFile: File | null;
  validationResult: BackupImportValidationResult | null;
  onExport: () => void;
  onRestore: () => void;
  onRestoreModeChange: (mode: BackupRestoreMode) => void;
  onValidateImport: (file: File | null) => void;
};

export function BackupWorkflowExportRestoreSection({
  isRestoreDisabled,
  pendingAction,
  restoreMode,
  selectedFile,
  validationResult,
  onExport,
  onRestore,
  onRestoreModeChange,
  onValidateImport,
}: Readonly<BackupWorkflowExportRestoreSectionProps>): ReactElement {
  return (
    <PageSection badge="Резервные копии">
      <Stack gap="md">
        <Stack gap="xs">
          <Button
            fullWidth
            loading={pendingAction === 'export'}
            onClick={onExport}
          >
            Скачать backup JSON
          </Button>
          <Text c="dimmed" size="xs">
            Экспортирует durable first data и metadata backup.
          </Text>
        </Stack>

        <Stack gap="xs">
          <FileInput
            accept="application/json,.json"
            clearable
            label="Файл backup"
            placeholder="Выберите JSON"
            value={selectedFile}
            onChange={onValidateImport}
          />
          <Text c="dimmed" size="xs">
            Проверка не меняет IndexedDB.{' '}
            {summarizeValidation(validationResult)}
          </Text>
        </Stack>

        <Radio.Group
          label="Режим восстановления"
          value={restoreMode}
          onChange={(value) => {
            onRestoreModeChange(value as BackupRestoreMode);
          }}
        >
          <Stack gap="xs" mt="xs">
            {restoreModes.map((mode) => (
              <Radio
                description={mode.description}
                key={mode.value}
                label={mode.label}
                value={mode.value}
              />
            ))}
          </Stack>
        </Radio.Group>

        <Group grow>
          <Button
            color="red"
            disabled={isRestoreDisabled}
            fullWidth
            loading={pendingAction === 'restore'}
            onClick={onRestore}
          >
            Восстановить из backup
          </Button>
        </Group>
        <Text c="dimmed" size="xs">
          Restore создает checkpoint перед commit и пишет history record.
        </Text>
      </Stack>
    </PageSection>
  );
}
