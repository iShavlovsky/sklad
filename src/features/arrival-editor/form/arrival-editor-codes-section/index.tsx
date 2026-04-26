import type { ReactElement } from 'react';
import { Button, Group, Select, Stack, Text } from '@mantine/core';
import type { UseFormReturnType } from '@mantine/form';
import { IconListCheck } from '@tabler/icons-react';

import { FormSectionCard } from '@/shared/ui/form-shell';
import { SerialTokensInput } from '@/shared/ui/serial-tokens-input';

import {
  ARRIVAL_EDITOR_CODE_KIND_OPTIONS,
  ARRIVAL_EDITOR_COPY,
} from '../arrival-editor.constants.ts';
import type { ArrivalEditorFormValues } from '../arrival-editor.types.ts';

interface ArrivalEditorCodesSectionProps {
  bufferItemCount: number;
  form: UseFormReturnType<ArrivalEditorFormValues>;
  onOpenBufferPicker: () => void;
}

export function ArrivalEditorCodesSection({
  bufferItemCount,
  form,
  onOpenBufferPicker,
}: Readonly<ArrivalEditorCodesSectionProps>): ReactElement {
  return (
    <FormSectionCard
      description={ARRIVAL_EDITOR_COPY.sections.codesDescription}
      title="Коды"
    >
      <Stack gap="sm">
        <Group justify="space-between" wrap="wrap">
          <Text c="dimmed" size="sm">
            {bufferItemCount > 0
              ? `В общем буфере: ${bufferItemCount}`
              : 'Общий буфер пока пуст.'}
          </Text>
          <Button
            leftSection={<IconListCheck size={16} stroke={1.8} />}
            onClick={onOpenBufferPicker}
            type="button"
            variant="default"
          >
            Выбрать из буфера
          </Button>
        </Group>
        <Select
          data={ARRIVAL_EDITOR_CODE_KIND_OPTIONS}
          label="Тип кода"
          onChange={(value) => {
            form.setFieldValue('codeKind', value ?? 'custom');
          }}
          value={form.values.codeKind}
        />
        <SerialTokensInput
          onChange={(value) => {
            form.setFieldValue('codes', value);
          }}
          value={form.values.codes}
        />
      </Stack>
    </FormSectionCard>
  );
}
