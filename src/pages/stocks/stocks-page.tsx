import type { ReactElement } from 'react';
import { Stack } from '@mantine/core';

import { BottomSpacer, PageContainer } from '@/shared/ui/page-primitives';

import { StockAdjustmentDialog } from './dialogs/stock-adjustment-dialog.tsx';
import { useStocksPageState } from './lib/use-stocks-page-state.ts';
import { StocksListSection } from './sections/stocks-list-section.tsx';

export function StocksPage(): ReactElement {
  const state = useStocksPageState();

  return (
    <PageContainer scrollable={false}>
      <Stack
        className="mobile-page-sections"
        gap="var(--sl-page-section-gap)"
        style={{ flex: '1 1 auto', minHeight: 0 }}
      >
        <StocksListSection state={state} />
      </Stack>

      <BottomSpacer />

      <StockAdjustmentDialog state={state} />
    </PageContainer>
  );
}
