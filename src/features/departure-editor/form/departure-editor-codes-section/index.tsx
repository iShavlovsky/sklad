import type { ReactElement } from 'react';
import { Button, Group, Select, Stack, Text } from '@mantine/core';
import type { UseFormReturnType } from '@mantine/form';
import { IconListCheck, IconQrcode } from '@tabler/icons-react';

import { FormSectionCard } from '@/shared/ui/form-shell';
import { SerialTokensInput } from '@/shared/ui/serial-tokens-input';

import {
  DEPARTURE_EDITOR_CODE_KIND_OPTIONS,
  DEPARTURE_EDITOR_COPY,
} from '../departure-editor.constants.ts';
import { countDepartureCodes } from '../departure-editor.mappers.ts';
import type { DepartureEditorFormValues } from '../departure-editor.types.ts';

interface DepartureEditorCodesSectionProps {
  bufferItemCount: number;
  form: UseFormReturnType<DepartureEditorFormValues>;
  onOpenBufferPicker: () => void;
  onOpenScanner: () => void;
}

export function DepartureEditorCodesSection({
  bufferItemCount,
  form,
  onOpenBufferPicker,
  onOpenScanner,
}: Readonly<DepartureEditorCodesSectionProps>): ReactElement {
  const selectedCodeCount = countDepartureCodes(form.values.codes);

  return (
    <FormSectionCard
      description={DEPARTURE_EDITOR_COPY.sections.codesDescription}
      title="Коды"
    >
      <Stack gap="sm">
        <Group justify="space-between" wrap="wrap">
          <Text c="dimmed" size="sm">
            {bufferItemCount > 0
              ? `В общем буфере: ${bufferItemCount}`
              : 'Общий буфер пока пуст.'}
          </Text>
          <Group gap="xs">
            <Button
              data-testid="departure-open-scanner-button"
              leftSection={<IconQrcode size={16} stroke={1.8} />}
              onClick={onOpenScanner}
              type="button"
              variant="default"
            >
              Открыть сканер
            </Button>
            <Button
              data-testid="departure-open-buffer-picker-button"
              leftSection={<IconListCheck size={16} stroke={1.8} />}
              onClick={onOpenBufferPicker}
              type="button"
              variant="default"
            >
              Выбрать из буфера
            </Button>
          </Group>
        </Group>
        <Text c="dimmed" size="sm">
          {DEPARTURE_EDITOR_COPY.scannerHint}
        </Text>
        <Select
          data={DEPARTURE_EDITOR_CODE_KIND_OPTIONS}
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
        <Text c="dimmed" size="sm">
          {`Количество кодов: ${selectedCodeCount}`}
        </Text>
      </Stack>
    </FormSectionCard>
  );
}
