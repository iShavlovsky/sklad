import type { ReactElement } from 'react';
import { Textarea } from '@mantine/core';

import { FieldInlineIcon } from '@/shared/ui/field-visuals';

import { FieldLabel } from '@/features/form-controls/support/field-info-trigger';

import { NOTE_FIELD_METADATA } from './field-family-note.constants.ts';
import type { NoteFieldFamilyProps } from './field-family-note.types.ts';

export function NoteFieldFamily<TValues>({
  form,
  metadata = NOTE_FIELD_METADATA,
  path,
}: Readonly<NoteFieldFamilyProps<TValues>>): ReactElement {
  return (
    <Textarea
      key={form.key(path)}
      label={<FieldLabel metadata={metadata} />}
      leftSection={<FieldInlineIcon field="note" />}
      minRows={2}
      {...form.getInputProps(path)}
    />
  );
}
