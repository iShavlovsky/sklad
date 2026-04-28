import type { ReactElement } from 'react';
import { Box, Stack, Text } from '@mantine/core';

import { CollectionSection } from '@/shared/ui/collection-section';
import {
  PreviewActionButton,
  RecordPreviewDrawer,
} from '@/shared/ui/record-card';

import {
  ProductCard,
  ProductPreviewContent,
} from '../components/product-card/product-card.tsx';
import { PRODUCTS_SORT_OPTIONS } from '../lib/products-page-formatters.ts';
import type { ProductsPageState } from '../lib/use-products-page-state.ts';

export function ProductsListSection({
  state,
}: Readonly<{ state: ProductsPageState }>): ReactElement {
  const { selectedProduct } = state;
  const selectedSupplierName = selectedProduct?.supplierId
    ? (state.supplierNameById.get(selectedProduct.supplierId) ?? null)
    : null;
  const selectedCategoryName = selectedProduct?.categoryId
    ? (state.categoryNameById.get(selectedProduct.categoryId) ?? null)
    : null;

  return (
    <Box
      className="page-section"
      style={{ display: 'flex', flex: '1 1 auto', minHeight: 0 }}
    >
      <CollectionSection
        emptyState={
          <Stack align="center" gap="xs">
            <Text fw={600}>Товары не найдены</Text>
            <Text c="dimmed" size="sm" ta="center">
              Измените поиск или добавьте товар из прихода.
            </Text>
          </Stack>
        }
        filterMenu={state.filterMenu}
        footer={() => (
          <Text c="dimmed" size="xs">
            Товаров: {state.products.length}
          </Text>
        )}
        getItemId={(item) => item.id}
        items={state.products}
        listLabel="Список товаров"
        onSearchChange={state.setSearchValue}
        onSortChange={state.setSortValue}
        renderItem={(product) => (
          <ProductCard
            categoryName={
              product.categoryId
                ? (state.categoryNameById.get(product.categoryId) ?? null)
                : null
            }
            onOpen={() => state.openSelected(product)}
            product={product}
            supplierName={
              product.supplierId
                ? (state.supplierNameById.get(product.supplierId) ?? null)
                : null
            }
          />
        )}
        searchPlaceholder="Поиск по названию или заметке"
        searchValue={state.searchValue}
        sortOptions={PRODUCTS_SORT_OPTIONS}
        sortValue={state.sortValue}
      />
      <RecordPreviewDrawer
        actions={
          selectedProduct ? (
            <PreviewActionButton
              onClick={() => state.openEdit(selectedProduct)}
            >
              Редактировать
            </PreviewActionButton>
          ) : null
        }
        onClose={state.closeSelected}
        opened={selectedProduct !== null}
        title={selectedProduct?.name ?? 'Карточка товара'}
      >
        {selectedProduct ? (
          <ProductPreviewContent
            categoryName={selectedCategoryName}
            product={selectedProduct}
            supplierName={selectedSupplierName}
          />
        ) : null}
      </RecordPreviewDrawer>
    </Box>
  );
}
