import type { ReactElement } from 'react';
import { Box, Stack, Text } from '@mantine/core';

import type { StockDeparturePrefillState } from '@/features/stocks/departure-prefill/stock-departure-prefill.ts';
import { buildStockDeparturePrefill } from '@/features/stocks/departure-prefill/stock-departure-prefill.ts';
import { useAppNavigate } from '@/router';
import { CollectionSection } from '@/shared/ui/collection-section';
import {
  PreviewActionButton,
  RecordPreviewDrawer,
} from '@/shared/ui/record-card';

import { StockCard, StockPreviewContent } from '../components/stock-card/stock-card';
import {
  formatStockDate,
  STOCKS_SORT_OPTIONS,
} from '../lib/stocks-page-formatters.ts';
import type { StocksPageState } from '../lib/use-stocks-page-state.ts';

interface StocksListSectionProps {
  state: StocksPageState;
}

export function StocksListSection({
  state,
}: Readonly<StocksListSectionProps>): ReactElement {
  const navigate = useAppNavigate();
  const { selectedStock } = state;

  return (
    <Box
      className="page-section"
      style={{ display: 'flex', flex: '1 1 auto', minHeight: 0 }}
    >
      <CollectionSection
        emptyState={
          <Stack align="center" gap="xs">
            <Text fw={600}>Совпадений по остаткам нет</Text>
            <Text c="dimmed" size="sm" ta="center">
              Снимите ограничение или добавьте приходную запись.
            </Text>
          </Stack>
        }
        filterMenu={state.filterMenu}
        footer={() => (
          <Stack gap="xs">
            <Text c="dimmed" size="xs">
              Позиций: {state.stocks.length}
            </Text>
            <Text c="dimmed" size="xs">
              С положительным остатком:{' '}
              {state.stocks.filter((item) => item.balance > 0).length}
            </Text>
          </Stack>
        )}
        getItemId={(item) => item.id}
        items={state.stocks}
        listLabel="Список остатков"
        onSearchChange={state.setSearchValue}
        onSortChange={state.setSortValue}
        renderItem={(item) => (
          <StockCard item={item} onOpen={() => state.openDetails(item.id)} />
        )}
        searchPlaceholder="Поиск по названию, поставщику или категории"
        searchValue={state.searchValue}
        sortOptions={STOCKS_SORT_OPTIONS}
        sortValue={state.sortValue}
      />
      <RecordPreviewDrawer
        actions={
          selectedStock ? (
            <>
              <PreviewActionButton
                disabled={selectedStock.balance <= 0}
                onClick={() =>
                  state.openDepartureCreate({
                    stockDeparturePrefill:
                      buildStockDeparturePrefill(selectedStock),
                  } satisfies StockDeparturePrefillState)
                }
              >
                Расход
              </PreviewActionButton>
              <PreviewActionButton
                disabled={selectedStock.availableCodes.length > 0}
                onClick={() => state.openAdjustmentModal(selectedStock.id)}
              >
                Корректировка
              </PreviewActionButton>
              <PreviewActionButton
                onClick={() =>
                  navigate.to('root.stocks.details', {
                    params: { stockId: selectedStock.id },
                  })
                }
                variant="filled"
              >
                Детали
              </PreviewActionButton>
            </>
          ) : null
        }
        onClose={state.closeDetails}
        opened={selectedStock !== null}
        subtitle={
          selectedStock
            ? `Обновлено ${formatStockDate(selectedStock.updatedAt)}`
            : ''
        }
        title={selectedStock?.title ?? 'Карточка остатка'}
      >
        {selectedStock ? <StockPreviewContent item={selectedStock} /> : null}
      </RecordPreviewDrawer>
    </Box>
  );
}
