import type { ReactElement } from 'react';
import { Stack } from '@mantine/core';
import type { UseFormReturnType } from '@mantine/form';

import { FormSectionCard } from '@/shared/ui/form-shell';

import type { ArrivalEditorFormValues } from '../arrival-editor.types.ts';
import { DirectoryField } from '../directory-field.tsx';

interface ArrivalEditorDirectoriesSectionProps {
  form: UseFormReturnType<ArrivalEditorFormValues>;
}

export function ArrivalEditorDirectoriesSection({
  form,
}: Readonly<ArrivalEditorDirectoriesSectionProps>): ReactElement {
  return (
    <FormSectionCard title="Справочники">
      <Stack gap="sm">
        <DirectoryField form={form} label="Поставщик" path="supplier" />
        <DirectoryField form={form} label="Товар" path="product" />
        <DirectoryField form={form} label="Категория" path="category" />
      </Stack>
    </FormSectionCard>
  );
}
