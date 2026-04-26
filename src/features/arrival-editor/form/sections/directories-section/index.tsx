import type { ReactElement } from 'react';
import { SimpleGrid } from '@mantine/core';
import type { UseFormReturnType } from '@mantine/form';

import { ARRIVAL_FORM_PREFERENCE_KEYS } from '@/features/arrival-editor/form/model/arrival-form.constants.ts';
import type { ArrivalEditorFormValues } from '@/features/arrival-editor/form/model/arrival-form.types.ts';
import { DirectoryFieldFamily } from '@/features/form-fields/field-family-directory';
import { FormSectionCard } from '@/shared/ui/form-shell';

interface ArrivalDirectoriesSectionProps {
  form: UseFormReturnType<ArrivalEditorFormValues>;
}

export function ArrivalDirectoriesSection({
  form,
}: Readonly<ArrivalDirectoriesSectionProps>): ReactElement {
  return (
    <FormSectionCard>
      <SimpleGrid cols={{ base: 1, xs: 2 }} spacing="xs">
        <DirectoryFieldFamily
          form={form}
          kind="supplier"
          paths={{
            createIfMissingPath: 'supplier.createIfMissing',
            idPath: 'supplier.id',
            namePath: 'supplier.name',
          }}
          preferenceKey={ARRIVAL_FORM_PREFERENCE_KEYS.supplierCreateIfMissing}
        />
        <DirectoryFieldFamily
          form={form}
          kind="product"
          paths={{
            createIfMissingPath: 'product.createIfMissing',
            idPath: 'product.id',
            namePath: 'product.name',
          }}
          preferenceKey={ARRIVAL_FORM_PREFERENCE_KEYS.productCreateIfMissing}
        />
        <DirectoryFieldFamily
          form={form}
          kind="category"
          paths={{
            createIfMissingPath: 'category.createIfMissing',
            idPath: 'category.id',
            namePath: 'category.name',
          }}
          preferenceKey={ARRIVAL_FORM_PREFERENCE_KEYS.categoryCreateIfMissing}
        />
      </SimpleGrid>
    </FormSectionCard>
  );
}
