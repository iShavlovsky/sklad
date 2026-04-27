import type { ReactElement } from 'react';
import { Select } from '@mantine/core';

import { formPreferencesStore } from '@/features/form-preferences/model/form-preferences.store.ts';
import { FieldInlineIcon } from '@/shared/ui/field-visuals';

import { FieldLabel } from '@/features/form-controls/support/field-info-trigger';

import {
  SUBJECT_KIND_FIELD_METADATA,
  SUBJECT_KIND_OPTIONS,
} from './field-family-subject-kind.constants.ts';
import type { SubjectKindFieldFamilyProps } from './field-family-subject-kind.types.ts';

export function SubjectKindFieldFamily<TValues>({
  form,
  metadata = SUBJECT_KIND_FIELD_METADATA,
  path,
  preferenceKey,
}: Readonly<SubjectKindFieldFamilyProps<TValues>>): ReactElement {
  return (
    <Select
      data={SUBJECT_KIND_OPTIONS}
      label={<FieldLabel metadata={metadata} />}
      leftSection={<FieldInlineIcon field="subjectKind" />}
      onChange={(value) => {
        const nextValue = value ?? 'other';
        form.setFieldValue(path, nextValue as never);

        if (preferenceKey) {
          formPreferencesStore
            .getState()
            .rememberValue(preferenceKey, nextValue);
        }
      }}
      value={(form.getValues() as Record<string, string>)[path] ?? 'other'}
    />
  );
}
