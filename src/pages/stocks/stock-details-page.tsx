import type { ReactElement } from 'react';
import { useParams } from 'react-router-dom';
import { Badge, Button, Group, Text } from '@mantine/core';

import { useStockList } from '@/features/stocks/data/hooks/use-stock-list.ts';
import { useAppNavigate } from '@/router';
import {
  BottomSpacer,
  PageContainer,
  PrimaryActionRow,
  SectionStack,
} from '@/shared/ui/page-primitives';
import { PageSection } from '@/shared/ui/page-section';
import { PreviewMetricGrid } from '@/shared/ui/record-card';

import { StockPreviewContent } from './components/stock-card/stock-card';
import {
  formatStockDate,
  STOCK_SUBJECT_KIND_LABELS,
} from './lib/stocks-page-formatters.ts';

export function StockDetailsPage(): ReactElement {
  const navigate = useAppNavigate();
  const params = useParams<'stockId'>();
  const stockId = params.stockId ?? '';
  const stocks = useStockList({
    filters: {
      categoryId: null,
      inStockOnly: false,
      productId: null,
      search: '',
      subjectKind: null,
      supplierId: null,
    },
    limit: null,
    offset: 0,
    sort: { direction: 'desc', field: 'updatedAt' },
  });
  const stock = stocks.find((item) => item.id === stockId) ?? null;

  return (
    <PageContainer>
      <PrimaryActionRow>
        <Button onClick={() => navigate.to('root.stocks')} variant="default">
          К остаткам
        </Button>
      </PrimaryActionRow>

      <SectionStack>
        {stock ? (
          <>
            <PageSection badge="Full" title="Сводка остатка">
              <StockPreviewContent item={stock} />
            </PageSection>
            <PageSection badge="Связи" title="Справочники и движение">
              <PreviewMetricGrid
                metrics={[
                  {
                    field: 'subjectKind',
                    label: 'Тип',
                    value: STOCK_SUBJECT_KIND_LABELS[stock.subjectKind],
                  },
                  {
                    field: 'updatedAt',
                    label: 'Обновлено',
                    value: formatStockDate(stock.updatedAt),
                  },
                  {
                    field: 'source',
                    label: 'Приходов',
                    value: stock.arrivalCount,
                  },
                  {
                    field: 'departureMode',
                    label: 'Расходов',
                    value: stock.departureCount,
                  },
                  {
                    field: 'supplier',
                    label: 'Поставщик',
                    value: stock.supplierName || '—',
                  },
                  {
                    field: 'product',
                    label: 'Товар',
                    value: stock.productName || '—',
                  },
                ]}
              />
            </PageSection>
            <PageSection badge="Коды" title="Доступные коды">
              <Group gap="xs">
                {stock.availableCodes.length > 0 ? (
                  stock.availableCodes.map((code) => (
                    <Badge key={code} variant="light">
                      {code}
                    </Badge>
                  ))
                ) : (
                  <Text c="dimmed" size="sm">
                    Свободных кодов нет.
                  </Text>
                )}
              </Group>
            </PageSection>
          </>
        ) : (
          <PageSection badge="Нет данных" title="Остаток не найден">
            <Text c="dimmed" size="sm">
              Позиция могла исчезнуть после изменения приходов или расходов.
            </Text>
          </PageSection>
        )}
      </SectionStack>

      <BottomSpacer />
    </PageContainer>
  );
}
