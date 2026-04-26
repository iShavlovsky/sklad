import type { ReactElement } from 'react';
import { DateTimePicker } from '@mantine/dates';

import { FieldLabel } from '../field-info-trigger';
import { getFieldPlaceholder } from '../field-metadata/field-metadata.helpers.ts';
import { FieldInlineIcon } from '../field-visuals';

import { OCCURRED_AT_FIELD_METADATA } from './field-family-occurred-at.constants.ts';
import type { OccurredAtFieldFamilyProps } from './field-family-occurred-at.types.ts';

export function OccurredAtFieldFamily<TValues>({
  form,
  metadata = OCCURRED_AT_FIELD_METADATA,
  onChange,
  path,
  testId,
  value,
}: Readonly<OccurredAtFieldFamilyProps<TValues>>): ReactElement {
  return (
    <DateTimePicker
      data-testid={testId}
      error={form.errors[path]}
      label={<FieldLabel metadata={metadata} />}
      leftSection={<FieldInlineIcon field="occurredAt" />}
      onChange={(nextValue) => {
        onChange(nextValue ?? '');
      }}
      placeholder={getFieldPlaceholder(metadata)}
      timePickerProps={{ withDropdown: true }}
      value={value === '' ? null : value}
      valueFormat="DD.MM.YYYY HH:mm"
    />
  );
}
