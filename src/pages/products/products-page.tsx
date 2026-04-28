import type { ReactElement } from 'react';
import { Stack } from '@mantine/core';

import { BottomSpacer, PageContainer } from '@/shared/ui/page-primitives';

import { ProductEditDialog } from './dialogs/product-edit-dialog.tsx';
import { useProductsPageState } from './lib/use-products-page-state.ts';
import { ProductsListSection } from './sections/products-list-section.tsx';

export function ProductsPage(): ReactElement {
  const state = useProductsPageState();

  return (
    <PageContainer scrollable={false}>
      <Stack
        className="mobile-page-sections"
        gap="var(--sl-page-section-gap)"
        style={{ flex: '1 1 auto', minHeight: 0 }}
      >
        <ProductsListSection state={state} />
      </Stack>

      <BottomSpacer />
      <ProductEditDialog state={state} />
    </PageContainer>
  );
}
