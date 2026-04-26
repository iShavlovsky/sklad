import type { ReactElement } from 'react';
import { Group, Radio } from '@mantine/core';

import { formPreferencesStore } from '@/features/form-preferences/model/form-preferences.store.ts';

import { FieldLabel } from '../field-info-trigger';
import { FieldInlineIcon } from '../field-visuals';

import {
  DEPARTURE_MODE_FIELD_METADATA,
  DEPARTURE_MODE_OPTIONS,
} from './field-family-departure-mode.constants.ts';
import type { DepartureModeFieldFamilyProps } from './field-family-departure-mode.types.ts';

export function DepartureModeFieldFamily<TValues>({
  form,
  metadata = DEPARTURE_MODE_FIELD_METADATA,
  path,
  preferenceKey,
}: Readonly<DepartureModeFieldFamilyProps<TValues>>): ReactElement {
  const value = (form.getValues() as Record<string, string>)[path] ?? 'loss';

  return (
    <Radio.Group
      label={
        <Group gap={6} wrap="nowrap">
          <FieldInlineIcon field="departureMode" />
          <FieldLabel metadata={metadata} />
        </Group>
      }
      onChange={(nextValue) => {
        form.setFieldValue(path, nextValue as never);

        if (preferenceKey) {
          formPreferencesStore
            .getState()
            .rememberValue(preferenceKey, nextValue);
        }
      }}
      value={value}
    >
      <Group grow mt="xs">
        {DEPARTURE_MODE_OPTIONS.map((option) => (
          <Radio key={option.value} label={option.label} value={option.value} />
        ))}
      </Group>
    </Radio.Group>
  );
}
