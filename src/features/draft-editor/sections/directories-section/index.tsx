import type { ReactElement } from 'react';
import { SimpleGrid } from '@mantine/core';
import type { UseFormReturnType } from '@mantine/form';

import { DirectoryFieldFamily } from '@/features/form-fields/field-family-directory';
import { FormSectionCard } from '@/shared/ui/form-shell';

import type { DraftEditorFormValues } from '../../model/draft-form.types.ts';

interface DraftDirectoriesSectionProps {
  form: UseFormReturnType<DraftEditorFormValues>;
}

export function DraftDirectoriesSection({
  form,
}: Readonly<DraftDirectoriesSectionProps>): ReactElement {
  return (
    <FormSectionCard>
      <SimpleGrid cols={{ base: 1, xs: 2 }} spacing="xs">
        <DirectoryFieldFamily
          form={form}
          kind="supplier"
          paths={{ idPath: 'supplierId', namePath: 'supplierName' }}
        />
        <DirectoryFieldFamily
          form={form}
          kind="product"
          paths={{ idPath: 'productId', namePath: 'productName' }}
        />
        <DirectoryFieldFamily
          form={form}
          kind="category"
          paths={{ idPath: 'categoryId', namePath: 'categoryName' }}
        />
      </SimpleGrid>
    </FormSectionCard>
  );
}
