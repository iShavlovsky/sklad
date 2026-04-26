import type { FieldMetadata } from '../field-metadata/field-metadata.types.ts';

export const DIRECTORY_FIELD_METADATA = {
  category: {
    selectOnly: {
      helpKey: 'field.directory.category.select',
      label: 'Категория',
      placeholder: 'Найдите категорию',
    },
    withCreateIfMissing: {
      helpKey: 'field.directory.category.create',
      label: 'Категория',
      placeholder: 'Найдите категорию',
    },
  },
  product: {
    selectOnly: {
      helpKey: 'field.directory.product.select',
      label: 'Товар',
      placeholder: 'Найдите товар',
    },
    withCreateIfMissing: {
      helpKey: 'field.directory.product.create',
      label: 'Товар',
      placeholder: 'Найдите товар',
    },
  },
  supplier: {
    selectOnly: {
      helpKey: 'field.directory.supplier.select',
      label: 'Поставщик',
      placeholder: 'Найдите поставщика',
    },
    withCreateIfMissing: {
      helpKey: 'field.directory.supplier.create',
      label: 'Поставщик',
      placeholder: 'Найдите поставщика',
    },
  },
} as const satisfies Record<
  string,
  {
    selectOnly: FieldMetadata;
    withCreateIfMissing: FieldMetadata;
  }
>;
