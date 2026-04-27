import type { ReactElement } from 'react';
import { TextInput } from '@mantine/core';

import { FieldInlineIcon } from '@/shared/ui/field-visuals';

import { FieldLabel } from '@/features/form-controls/support/field-info-trigger';
import { getFieldPlaceholder } from '@/features/form-controls/support/field-metadata/field-metadata.helpers.ts';

import { LINK_URL_FIELD_METADATA } from './field-family-link-url.constants.ts';
import type { LinkUrlFieldFamilyProps } from './field-family-link-url.types.ts';

export function LinkUrlFieldFamily<TValues>({
  form,
  metadata = LINK_URL_FIELD_METADATA,
  path,
}: Readonly<LinkUrlFieldFamilyProps<TValues>>): ReactElement {
  return (
    <TextInput
      key={form.key(path)}
      label={<FieldLabel metadata={metadata} />}
      leftSection={<FieldInlineIcon field="linkUrl" />}
      placeholder={getFieldPlaceholder(metadata)}
      {...form.getInputProps(path)}
    />
  );
}
