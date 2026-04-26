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

import { FormSectionCard } from '@/shared/ui/form-shell';

import { ARRIVAL_EDITOR_SUBJECT_KIND_OPTIONS } from '../arrival-editor.constants.ts';
import type { ArrivalEditorFormValues } from '../arrival-editor.types.ts';

interface ArrivalEditorBasicSectionProps {
  form: UseFormReturnType<ArrivalEditorFormValues>;
  occurredAtValue: string;
  onOccurredAtChange: (value: string) => void;
}

export function ArrivalEditorBasicSection({
  form,
  occurredAtValue,
  onOccurredAtChange,
}: Readonly<ArrivalEditorBasicSectionProps>): ReactElement {
  return (
    <FormSectionCard>
      <Stack gap="sm">
        <TextInput
          key={form.key('title')}
          label="Название"
          placeholder="Приход товара"
          withAsterisk
          {...form.getInputProps('title')}
        />
        <Select
          data={ARRIVAL_EDITOR_SUBJECT_KIND_OPTIONS}
          label="Тип субъекта"
          onChange={(value) => {
            form.setFieldValue('subjectKind', value ?? 'other');
          }}
          value={form.values.subjectKind}
        />
        <DateTimePicker
          data-testid="arrival-occurred-at-picker"
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
        <Group align="flex-start" grow wrap="wrap">
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
      </Stack>
    </FormSectionCard>
  );
}
