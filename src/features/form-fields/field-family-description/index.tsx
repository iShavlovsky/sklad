import type { ReactElement } from 'react';
import { Textarea } from '@mantine/core';

import { FieldLabel } from '@/features/form-controls/support/field-info-trigger';
import { FieldInlineIcon } from '@/shared/ui/field-visuals';

import { DESCRIPTION_FIELD_METADATA } from './field-family-description.constants.ts';
import type { DescriptionFieldFamilyProps } from './field-family-description.types.ts';

export function DescriptionFieldFamily<TValues>({
  form,
  metadata = DESCRIPTION_FIELD_METADATA,
  path,
}: Readonly<DescriptionFieldFamilyProps<TValues>>): ReactElement {
  return (
    <Textarea
      key={form.key(path)}
      label={<FieldLabel metadata={metadata} />}
      leftSection={<FieldInlineIcon field="description" />}
      minRows={2}
      {...form.getInputProps(path)}
    />
  );
}
