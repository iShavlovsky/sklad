import type { ReactElement } from 'react';
import { SimpleGrid } from '@mantine/core';
import type { UseFormReturnType } from '@mantine/form';

import { DirectoryFieldFamily } from '@/features/form-fields/field-family-directory';
import { FormSectionCard } from '@/shared/ui/form-shell';

import { DEPARTURE_FORM_PREFERENCE_KEYS } from '../model/departure-editor.form-constants.ts';
import type { DepartureEditorFormValues } from '../model/departure-editor.form-values.ts';

interface DepartureDirectoriesSectionProps {
  form: UseFormReturnType<DepartureEditorFormValues>;
}

export function DepartureDirectoriesSection({
  form,
}: Readonly<DepartureDirectoriesSectionProps>): ReactElement {
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
          preferenceKey={DEPARTURE_FORM_PREFERENCE_KEYS.supplierCreateIfMissing}
        />
        <DirectoryFieldFamily
          form={form}
          kind="product"
          paths={{
            createIfMissingPath: 'product.createIfMissing',
            idPath: 'product.id',
            namePath: 'product.name',
          }}
          preferenceKey={DEPARTURE_FORM_PREFERENCE_KEYS.productCreateIfMissing}
        />
        <DirectoryFieldFamily
          form={form}
          kind="category"
          paths={{
            createIfMissingPath: 'category.createIfMissing',
            idPath: 'category.id',
            namePath: 'category.name',
          }}
          preferenceKey={DEPARTURE_FORM_PREFERENCE_KEYS.categoryCreateIfMissing}
        />
      </SimpleGrid>
    </FormSectionCard>
  );
}
