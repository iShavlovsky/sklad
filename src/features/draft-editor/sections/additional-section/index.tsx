import type { ReactElement } from 'react';
import { Stack } from '@mantine/core';
import type { UseFormReturnType } from '@mantine/form';

import { DescriptionFieldFamily } from '@/features/form-fields/field-family-description';
import { DirectionFieldFamily } from '@/features/form-fields/field-family-direction';
import { LinkUrlFieldFamily } from '@/features/form-fields/field-family-link-url';
import { NoteFieldFamily } from '@/features/form-fields/field-family-note';
import { FormSectionCard } from '@/shared/ui/form-shell';

import type { DraftEditorFormValues } from '../../model/draft-form.types.ts';

interface DraftAdditionalSectionProps {
  form: UseFormReturnType<DraftEditorFormValues>;
}

export function DraftAdditionalSection({
  form,
}: Readonly<DraftAdditionalSectionProps>): ReactElement {
  const { kind } = form.values;

  return (
    <FormSectionCard>
      <Stack gap="xs">
        <DescriptionFieldFamily form={form} path="description" />
        {kind === 'arrival' ? (
          <LinkUrlFieldFamily form={form} path="linkUrl" />
        ) : (
          <DirectionFieldFamily form={form} path="direction" />
        )}
        <NoteFieldFamily form={form} path="note" />
      </Stack>
    </FormSectionCard>
  );
}
