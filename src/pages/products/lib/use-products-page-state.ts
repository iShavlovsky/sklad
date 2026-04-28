import { useMemo, useState } from 'react';

import type { ProductRecord } from '@/domain/directories/product.record.ts';
import { useCategoryList } from '@/features/directories/hooks/use-category-list.ts';
import { useProductList } from '@/features/directories/hooks/use-product-list.ts';
import { useSupplierList } from '@/features/directories/hooks/use-supplier-list.ts';
import type { CollectionFilterMenuConfig } from '@/shared/ui/collection-section/types.ts';

type ProductSortValue = 'name-asc' | 'updatedAt-desc' | 'createdAt-desc';
type ProductArchivedFilter = 'active' | 'archived' | 'all';

function resolveArchivedFilter(value: ProductArchivedFilter): boolean | null {
  if (value === 'active') return false;
  if (value === 'archived') return true;
  return null;
}

function resolveSort(value: ProductSortValue) {
  switch (value) {
    case 'createdAt-desc':
      return { direction: 'desc' as const, field: 'createdAt' as const };
    case 'updatedAt-desc':
      return { direction: 'desc' as const, field: 'updatedAt' as const };
    case 'name-asc':
    default:
      return { direction: 'asc' as const, field: 'name' as const };
  }
}

export function useProductsPageState() {
  const [searchValue, setSearchValue] = useState('');
  const [archivedFilter, setArchivedFilter] =
    useState<ProductArchivedFilter>('active');
  const [sortValue, setSortValue] = useState<ProductSortValue>('name-asc');
  const [selectedProductId, setSelectedProductId] = useState<string | null>(
    null
  );
  const [editingProductId, setEditingProductId] = useState<string | null>(null);

  const products = useProductList({
    filters: {
      categoryId: null,
      isArchived: resolveArchivedFilter(archivedFilter),
      search: searchValue,
      supplierId: null,
    },
    limit: null,
    offset: 0,
    sort: resolveSort(sortValue),
  });
  const suppliers = useSupplierList({
    filters: { isArchived: false, search: '' },
    limit: null,
    offset: 0,
    sort: { direction: 'asc', field: 'name' },
  });
  const categories = useCategoryList({
    filters: { isArchived: false, search: '' },
    limit: null,
    offset: 0,
    sort: { direction: 'asc', field: 'name' },
  });

  const supplierNameById = useMemo(
    () => new Map(suppliers.map((supplier) => [supplier.id, supplier.name])),
    [suppliers]
  );
  const categoryNameById = useMemo(
    () => new Map(categories.map((category) => [category.id, category.name])),
    [categories]
  );
  const editingProduct =
    editingProductId === null
      ? null
      : (products.find((product) => product.id === editingProductId) ?? null);
  const selectedProduct =
    selectedProductId === null
      ? null
      : (products.find((product) => product.id === selectedProductId) ?? null);

  const filterMenu: CollectionFilterMenuConfig = {
    groups: [
      {
        items: [
          {
            checked: archivedFilter === 'active',
            key: 'active',
            label: 'Активные',
            onClick: () => setArchivedFilter('active'),
          },
          {
            checked: archivedFilter === 'archived',
            key: 'archived',
            label: 'Архивные',
            onClick: () => setArchivedFilter('archived'),
          },
          {
            checked: archivedFilter === 'all',
            key: 'all',
            label: 'Все',
            onClick: () => setArchivedFilter('all'),
          },
        ],
        key: 'archive',
        label: 'Статус',
      },
    ],
    triggerLabel: 'Фильтр',
  };

  return {
    categories,
    categoryNameById,
    closeEdit: () => setEditingProductId(null),
    closeSelected: () => setSelectedProductId(null),
    editingProduct,
    filterMenu,
    openEdit: (product: ProductRecord) => {
      setSelectedProductId(null);
      setEditingProductId(product.id);
    },
    openSelected: (product: ProductRecord) => setSelectedProductId(product.id),
    products,
    searchValue,
    selectedProduct,
    setSearchValue,
    setSortValue: (value: string | null) =>
      setSortValue((value as ProductSortValue | null) ?? 'name-asc'),
    sortValue,
    supplierNameById,
    suppliers,
  };
}

export type ProductsPageState = ReturnType<typeof useProductsPageState>;
