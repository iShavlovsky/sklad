import type { ReactElement } from 'react';
import { Checkbox, Group, Stack, TextInput } from '@mantine/core';
import type { UseFormReturnType } from '@mantine/form';

import { FormSectionCard } from '@/shared/ui/form-shell';

import type { DepartureEditorFormValues } from '../departure-editor.types.ts';

interface DepartureEditorDirectoriesSectionProps {
  form: UseFormReturnType<DepartureEditorFormValues>;
}

export function DepartureEditorDirectoriesSection({
  form,
}: Readonly<DepartureEditorDirectoriesSectionProps>): ReactElement {
  return (
    <FormSectionCard title="Справочники">
      <Stack gap="sm">
        <Group align="flex-start" grow wrap="wrap">
          <TextInput
            key={form.key('supplier.name')}
            label="Поставщик"
            placeholder="Имя поставщика"
            {...form.getInputProps('supplier.name')}
          />
          <TextInput
            key={form.key('product.name')}
            label="Товар"
            placeholder="Название"
            {...form.getInputProps('product.name')}
          />
        </Group>
        <TextInput
          key={form.key('category.name')}
          label="Категория"
          placeholder="Категория"
          {...form.getInputProps('category.name')}
        />
        <Group grow>
          <Checkbox
            checked={form.values.supplier.createIfMissing}
            label="Создать поставщика"
            onChange={(event) => {
              form.setFieldValue(
                'supplier.createIfMissing',
                event.currentTarget.checked
              );
            }}
          />
          <Checkbox
            checked={form.values.product.createIfMissing}
            label="Создать товар"
            onChange={(event) => {
              form.setFieldValue(
                'product.createIfMissing',
                event.currentTarget.checked
              );
            }}
          />
          <Checkbox
            checked={form.values.category.createIfMissing}
            label="Создать категорию"
            onChange={(event) => {
              form.setFieldValue(
                'category.createIfMissing',
                event.currentTarget.checked
              );
            }}
          />
        </Group>
      </Stack>
    </FormSectionCard>
  );
}
