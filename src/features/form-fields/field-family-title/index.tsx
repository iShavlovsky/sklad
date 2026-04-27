import type { ReactElement } from 'react';
import { TextInput } from '@mantine/core';

import { FieldLabel } from '@/features/form-controls/support/field-info-trigger';
import { getFieldPlaceholder } from '@/features/form-controls/support/field-metadata/field-metadata.helpers.ts';
import { FieldInlineIcon } from '@/shared/ui/field-visuals';

import { TITLE_FIELD_METADATA } from './field-family-title.constants.ts';
import type { TitleFieldFamilyProps } from './field-family-title.types.ts';

export function TitleFieldFamily<TValues>({
  form,
  metadata = TITLE_FIELD_METADATA,
  path,
}: Readonly<TitleFieldFamilyProps<TValues>>): ReactElement {
  return (
    <TextInput
      key={form.key(path)}
      label={<FieldLabel metadata={metadata} />}
      leftSection={<FieldInlineIcon field="title" />}
      placeholder={getFieldPlaceholder(metadata)}
      {...form.getInputProps(path)}
    />
  );
}
