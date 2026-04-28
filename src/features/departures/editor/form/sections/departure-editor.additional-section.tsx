import type { ReactElement } from 'react';
import { Stack } from '@mantine/core';
import type { UseFormReturnType } from '@mantine/form';

import type { FieldMetadata } from '@/features/form-controls/support/field-metadata/field-metadata.types.ts';
import { DescriptionFieldFamily } from '@/features/form-fields/field-family-description';
import { DirectionFieldFamily } from '@/features/form-fields/field-family-direction';
import { NoteFieldFamily } from '@/features/form-fields/field-family-note';
import { TitleFieldFamily } from '@/features/form-fields/field-family-title';
import { FormSectionCard } from '@/shared/ui/form-shell';

import type { DepartureEditorFormValues } from '../model/departure-editor.form-values.ts';

const OPTIONAL_TITLE_METADATA: FieldMetadata = {
  helpKey: 'field.title',
  label: 'Название',
  placeholder: 'Заполнится автоматически',
};

interface DepartureAdditionalSectionProps {
  form: UseFormReturnType<DepartureEditorFormValues>;
}

export function DepartureAdditionalSection({
  form,
}: Readonly<DepartureAdditionalSectionProps>): ReactElement {
  return (
    <FormSectionCard>
      <Stack gap="xs">
        <TitleFieldFamily
          form={form}
          metadata={OPTIONAL_TITLE_METADATA}
          path="title"
        />
        <DescriptionFieldFamily form={form} path="description" />
        <DirectionFieldFamily form={form} path="direction" />
        <NoteFieldFamily form={form} path="note" />
      </Stack>
    </FormSectionCard>
  );
}
