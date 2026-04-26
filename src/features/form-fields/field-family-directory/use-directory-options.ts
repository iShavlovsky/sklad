import { useMemo } from 'react';

import { useCategoryList } from '@/features/directories/hooks/use-category-list.ts';
import { useProductList } from '@/features/directories/hooks/use-product-list.ts';
import { useSupplierList } from '@/features/directories/hooks/use-supplier-list.ts';

import type { DirectoryFieldKind } from './field-family-directory.types.ts';

const DIRECTORY_QUERY_SORT = {
  direction: 'asc',
  field: 'name',
} as const;

export function useDirectoryOptions(
  kind: DirectoryFieldKind,
  search: string
): Array<{ label: string; value: string }> {
  const supplierQuery = useMemo(
    () => ({
      filters: {
        isArchived: false,
        search,
      },
      limit: 20,
      offset: 0,
      sort: DIRECTORY_QUERY_SORT,
    }),
    [search]
  );
  const productQuery = useMemo(
    () => ({
      filters: {
        categoryId: null,
        isArchived: false,
        search,
        supplierId: null,
      },
      limit: 20,
      offset: 0,
      sort: DIRECTORY_QUERY_SORT,
    }),
    [search]
  );
  const categoryQuery = useMemo(
    () => ({
      filters: {
        isArchived: false,
        search,
      },
      limit: 20,
      offset: 0,
      sort: DIRECTORY_QUERY_SORT,
    }),
    [search]
  );

  const suppliers = useSupplierList(supplierQuery);
  const products = useProductList(productQuery);
  const categories = useCategoryList(categoryQuery);

  const rows =
    kind === 'supplier'
      ? suppliers
      : kind === 'product'
        ? products
        : categories;

  return rows.map((row) => ({
    label: row.name,
    value: row.id,
  }));
}
