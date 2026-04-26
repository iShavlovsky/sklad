import type { ReactElement } from 'react';
import { TextInput } from '@mantine/core';

import { FieldLabel } from '../field-info-trigger';
import { getFieldPlaceholder } from '../field-metadata/field-metadata.helpers.ts';
import { FieldInlineIcon } from '../field-visuals';

import { DIRECTION_FIELD_METADATA } from './field-family-direction.constants.ts';
import type { DirectionFieldFamilyProps } from './field-family-direction.types.ts';

export function DirectionFieldFamily<TValues>({
  form,
  metadata = DIRECTION_FIELD_METADATA,
  path,
}: Readonly<DirectionFieldFamilyProps<TValues>>): ReactElement {
  return (
    <TextInput
      key={form.key(path)}
      label={<FieldLabel metadata={metadata} />}
      leftSection={<FieldInlineIcon field="direction" />}
      placeholder={getFieldPlaceholder(metadata)}
      {...form.getInputProps(path)}
    />
  );
}
