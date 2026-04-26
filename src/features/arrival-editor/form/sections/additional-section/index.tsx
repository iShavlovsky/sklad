import type { ReactElement } from 'react';
import { Stack } from '@mantine/core';
import type { UseFormReturnType } from '@mantine/form';

import type { ArrivalEditorFormValues } from '@/features/arrival-editor/form/model/arrival-form.types.ts';
import { DescriptionFieldFamily } from '@/features/form-fields/field-family-description';
import { LinkUrlFieldFamily } from '@/features/form-fields/field-family-link-url';
import { NoteFieldFamily } from '@/features/form-fields/field-family-note';
import { FormSectionCard } from '@/shared/ui/form-shell';

interface ArrivalAdditionalSectionProps {
  form: UseFormReturnType<ArrivalEditorFormValues>;
}

export function ArrivalAdditionalSection({
  form,
}: Readonly<ArrivalAdditionalSectionProps>): ReactElement {
  return (
    <FormSectionCard>
      <Stack gap="xs">
        <DescriptionFieldFamily form={form} path="description" />
        <LinkUrlFieldFamily form={form} path="linkUrl" />
        <NoteFieldFamily form={form} path="note" />
      </Stack>
    </FormSectionCard>
  );
}
