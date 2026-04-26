import type { ReactElement } from 'react';
import { Stack, TextInput } from '@mantine/core';
import type { UseFormReturnType } from '@mantine/form';

import { FormSectionCard } from '@/shared/ui/form-shell';

import type { DraftEditorFormValues } from '../draft-editor.types.ts';

interface DraftEditorDirectoriesSectionProps {
  form: UseFormReturnType<DraftEditorFormValues>;
}

export function DraftEditorDirectoriesSection({
  form,
}: Readonly<DraftEditorDirectoriesSectionProps>): ReactElement {
  return (
    <FormSectionCard title="Справочники">
      <Stack gap="sm">
        <TextInput
          key={form.key('supplierName')}
          label="Поставщик"
          {...form.getInputProps('supplierName')}
        />
        <TextInput
          key={form.key('productName')}
          label="Товар"
          {...form.getInputProps('productName')}
        />
        <TextInput
          key={form.key('categoryName')}
          label="Категория"
          {...form.getInputProps('categoryName')}
        />
      </Stack>
    </FormSectionCard>
  );
}
