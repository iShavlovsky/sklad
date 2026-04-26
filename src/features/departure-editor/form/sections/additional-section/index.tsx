import type { ReactElement } from 'react';
import { Stack } from '@mantine/core';
import type { UseFormReturnType } from '@mantine/form';

import { DescriptionFieldFamily } from '@/features/form-fields/field-family-description';
import { DirectionFieldFamily } from '@/features/form-fields/field-family-direction';
import { NoteFieldFamily } from '@/features/form-fields/field-family-note';
import { FormSectionCard } from '@/shared/ui/form-shell';

import type { DepartureEditorFormValues } from '../../model/departure-form.types.ts';

interface DepartureAdditionalSectionProps {
  form: UseFormReturnType<DepartureEditorFormValues>;
}

export function DepartureAdditionalSection({
  form,
}: Readonly<DepartureAdditionalSectionProps>): ReactElement {
  return (
    <FormSectionCard>
      <Stack gap="xs">
        <DescriptionFieldFamily form={form} path="description" />
        <DirectionFieldFamily form={form} path="direction" />
        <NoteFieldFamily form={form} path="note" />
      </Stack>
    </FormSectionCard>
  );
}
