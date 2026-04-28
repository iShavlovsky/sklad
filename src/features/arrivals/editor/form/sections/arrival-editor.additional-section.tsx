import type { ReactElement } from 'react';
import { Stack } from '@mantine/core';
import type { UseFormReturnType } from '@mantine/form';

import type { ArrivalEditorFormValues } from '@/features/arrivals/editor/form/model/arrival-editor.form-values.ts';
import type { FieldMetadata } from '@/features/form-controls/support/field-metadata/field-metadata.types.ts';
import { DescriptionFieldFamily } from '@/features/form-fields/field-family-description';
import { LinkUrlFieldFamily } from '@/features/form-fields/field-family-link-url';
import { NoteFieldFamily } from '@/features/form-fields/field-family-note';
import { TitleFieldFamily } from '@/features/form-fields/field-family-title';
import { FormSectionCard } from '@/shared/ui/form-shell';

const OPTIONAL_TITLE_METADATA: FieldMetadata = {
  helpKey: 'field.title',
  label: 'Название',
  placeholder: 'Заполнится автоматически',
};

interface ArrivalAdditionalSectionProps {
  form: UseFormReturnType<ArrivalEditorFormValues>;
}

export function ArrivalAdditionalSection({
  form,
}: Readonly<ArrivalAdditionalSectionProps>): ReactElement {
  return (
    <FormSectionCard>
      <Stack gap="xs">
        <TitleFieldFamily
          form={form}
          metadata={OPTIONAL_TITLE_METADATA}
          path="title"
        />
        <DescriptionFieldFamily form={form} path="description" />
        <LinkUrlFieldFamily form={form} path="linkUrl" />
        <NoteFieldFamily form={form} path="note" />
      </Stack>
    </FormSectionCard>
  );
}
