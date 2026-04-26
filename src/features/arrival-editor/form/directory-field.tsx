import { type ReactElement, useEffect, useMemo, useState } from 'react';
import { Checkbox, Select, Stack, TextInput } from '@mantine/core';
import type { UseFormReturnType } from '@mantine/form';
import { useDebouncedValue } from '@mantine/hooks';

import { useCategoryList } from '@/features/directories/hooks/use-category-list.ts';
import { useProductList } from '@/features/directories/hooks/use-product-list.ts';
import { useSupplierList } from '@/features/directories/hooks/use-supplier-list.ts';

import type { ArrivalEditorFormValues } from './arrival-editor.types.ts';

interface DirectoryFieldProps {
  form: UseFormReturnType<ArrivalEditorFormValues>;
  label: string;
  path: 'supplier' | 'product' | 'category';
}

const DIRECTORY_QUERY_SORT = {
  field: 'name',
  direction: 'asc',
} as const;

function useDirectoryOptions(
  path: DirectoryFieldProps['path'],
  search: string
): Array<{ label: string; value: string }> {
  const supplierQuery = useMemo(
    () => ({
      filters: {
        search,
        isArchived: false,
      },
      sort: DIRECTORY_QUERY_SORT,
      limit: 20,
      offset: 0,
    }),
    [search]
  );
  const productQuery = useMemo(
    () => ({
      filters: {
        search,
        isArchived: false,
        supplierId: null,
        categoryId: null,
      },
      sort: DIRECTORY_QUERY_SORT,
      limit: 20,
      offset: 0,
    }),
    [search]
  );
  const categoryQuery = useMemo(
    () => ({
      filters: {
        search,
        isArchived: false,
      },
      sort: DIRECTORY_QUERY_SORT,
      limit: 20,
      offset: 0,
    }),
    [search]
  );

  const suppliers = useSupplierList(supplierQuery);
  const products = useProductList(productQuery);
  const categories = useCategoryList(categoryQuery);

  const rows =
    path === 'supplier'
      ? suppliers
      : path === 'product'
        ? products
        : categories;

  return rows.map((row) => ({
    label: row.name,
    value: row.id,
  }));
}

export function DirectoryField({
  form,
  label,
  path,
}: Readonly<DirectoryFieldProps>): ReactElement {
  const selectedValue = form.values[path];
  const [searchValue, setSearchValue] = useState(selectedValue.name);
  const [debouncedSearch] = useDebouncedValue(searchValue, 150);
  const options = useDirectoryOptions(path, debouncedSearch);

  useEffect(() => {
    if (!selectedValue.createIfMissing) {
      queueMicrotask(() => {
        setSearchValue(selectedValue.name);
      });
    }
  }, [selectedValue.createIfMissing, selectedValue.name]);

  return (
    <Stack gap="xs">
      {!selectedValue.createIfMissing ? (
        <Select
          clearable
          data={options}
          description={`Можно выбрать существующий ${label.toLowerCase()} или переключиться на создание.`}
          label={label}
          nothingFoundMessage="Совпадений нет"
          onChange={(value) => {
            const next = options.find((option) => option.value === value);
            form.setFieldValue(`${path}.id`, value ?? '');
            form.setFieldValue(`${path}.name`, next?.label ?? '');
            setSearchValue(next?.label ?? '');
          }}
          onSearchChange={setSearchValue}
          placeholder={`Найдите ${label.toLowerCase()}`}
          searchable
          searchValue={searchValue}
          value={selectedValue.id === '' ? null : selectedValue.id}
        />
      ) : (
        <TextInput
          description="Имя будет отправлено в существующий first-data create-if-missing flow."
          label={label}
          onChange={(event) => {
            const nextValue = event.currentTarget.value;
            form.setFieldValue(`${path}.name`, nextValue);
            setSearchValue(nextValue);
          }}
          placeholder={`Новый ${label.toLowerCase()}`}
          value={selectedValue.name}
        />
      )}
      <Checkbox
        checked={selectedValue.createIfMissing}
        label={`Создать новый ${label.toLowerCase()}, если совпадение не найдено`}
        onChange={(event) => {
          const { checked } = event.currentTarget;
          form.setFieldValue(`${path}.createIfMissing`, checked);
          if (checked) {
            form.setFieldValue(`${path}.id`, '');
          } else {
            setSearchValue(form.values[path].name);
          }
        }}
      />
    </Stack>
  );
}
