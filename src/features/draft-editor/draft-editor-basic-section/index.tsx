import type { ReactElement } from 'react';
import {
  Group,
  NumberInput,
  Select,
  Stack,
  Textarea,
  TextInput,
} from '@mantine/core';
import { DateTimePicker } from '@mantine/dates';
import type { UseFormReturnType } from '@mantine/form';

import type {
  DepartureMode,
  RecordKind,
  SubjectKind,
} from '@/domain/common/record-kinds.ts';
import { FormSectionCard } from '@/shared/ui/form-shell';

import {
  DRAFT_EDITOR_DEPARTURE_MODE_OPTIONS,
  DRAFT_EDITOR_SUBJECT_KIND_OPTIONS,
} from '../draft-editor.constants.ts';
import type { DraftEditorFormValues } from '../draft-editor.types.ts';

interface DraftEditorBasicSectionProps {
  form: UseFormReturnType<DraftEditorFormValues>;
  kind: RecordKind;
  occurredAtValue: string;
  onOccurredAtChange: (value: string) => void;
}

export function DraftEditorBasicSection({
  form,
  kind,
  occurredAtValue,
  onOccurredAtChange,
}: Readonly<DraftEditorBasicSectionProps>): ReactElement {
  return (
    <FormSectionCard>
      <Stack gap="sm">
        <TextInput
          key={form.key('title')}
          label="Название"
          placeholder="Название записи"
          withAsterisk
          {...form.getInputProps('title')}
        />
        <Select
          data={[...DRAFT_EDITOR_SUBJECT_KIND_OPTIONS]}
          label="Тип субъекта"
          onChange={(value) => {
            form.setFieldValue(
              'subjectKind',
              (value as SubjectKind) ?? 'other'
            );
          }}
          value={form.values.subjectKind}
        />
        <DateTimePicker
          error={form.errors.occurredAt}
          label="Дата и время"
          onChange={(value) => {
            onOccurredAtChange(value ?? '');
          }}
          placeholder="Выберите дату и время"
          timePickerProps={{ withDropdown: true }}
          value={occurredAtValue === '' ? null : occurredAtValue}
          valueFormat="DD.MM.YYYY HH:mm"
          withAsterisk
        />
        <Group grow wrap="wrap">
          <NumberInput
            decimalScale={2}
            error={form.errors.amount}
            hideControls
            label="Сумма"
            onChange={(value) => {
              form.setFieldValue(
                'amount',
                value === '' || value === null ? '' : String(value)
              );
            }}
            placeholder="0"
            value={form.values.amount}
          />
          <TextInput
            key={form.key('currency')}
            label="Валюта"
            placeholder="RUB"
            {...form.getInputProps('currency')}
          />
        </Group>
        <Textarea
          key={form.key('description')}
          label="Описание"
          minRows={2}
          {...form.getInputProps('description')}
        />
        {kind === 'departure' ? (
          <Select
            data={[...DRAFT_EDITOR_DEPARTURE_MODE_OPTIONS]}
            label="Режим расхода"
            onChange={(value) => {
              form.setFieldValue(
                'departureMode',
                (value as DepartureMode) ?? 'loss'
              );
            }}
            value={form.values.departureMode}
          />
        ) : null}
      </Stack>
    </FormSectionCard>
  );
}
