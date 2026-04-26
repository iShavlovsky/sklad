import type { ReactElement } from 'react';
import {
  Group,
  NumberInput,
  Radio,
  Select,
  Stack,
  Textarea,
  TextInput,
} from '@mantine/core';
import { DateTimePicker } from '@mantine/dates';
import type { UseFormReturnType } from '@mantine/form';

import { FormSectionCard } from '@/shared/ui/form-shell';

import {
  DEPARTURE_EDITOR_MODE_OPTIONS,
  DEPARTURE_EDITOR_SUBJECT_KIND_OPTIONS,
} from '../departure-editor.constants.ts';
import type { DepartureEditorFormValues } from '../departure-editor.types.ts';

interface DepartureEditorBasicSectionProps {
  form: UseFormReturnType<DepartureEditorFormValues>;
  occurredAtValue: string;
  onOccurredAtChange: (value: string) => void;
}

export function DepartureEditorBasicSection({
  form,
  occurredAtValue,
  onOccurredAtChange,
}: Readonly<DepartureEditorBasicSectionProps>): ReactElement {
  return (
    <FormSectionCard>
      <Stack gap="sm">
        <TextInput
          key={form.key('title')}
          label="Название"
          placeholder="Название расхода"
          withAsterisk
          {...form.getInputProps('title')}
        />
        <Radio.Group
          label="Режим"
          onChange={(value) => {
            form.setFieldValue(
              'mode',
              value as DepartureEditorFormValues['mode']
            );
          }}
          value={form.values.mode}
        >
          <Group grow mt="xs">
            {DEPARTURE_EDITOR_MODE_OPTIONS.map((option) => (
              <Radio
                key={option.value}
                label={option.label}
                value={option.value}
              />
            ))}
          </Group>
        </Radio.Group>
        <Select
          data={DEPARTURE_EDITOR_SUBJECT_KIND_OPTIONS}
          label="Тип субъекта"
          onChange={(value) => {
            form.setFieldValue('subjectKind', value ?? 'other');
          }}
          value={form.values.subjectKind}
        />
        <DateTimePicker
          data-testid="departure-occurred-at-picker"
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
        <TextInput
          key={form.key('direction')}
          label="Направление"
          placeholder="Куда, кому, источник"
          {...form.getInputProps('direction')}
        />
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
