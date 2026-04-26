import { useMemo, useState } from 'react';
import { useForm } from '@mantine/form';

import type { SubjectKind } from '@/domain/common/record-kinds.ts';
import { useCreateArrival } from '@/features/arrival-editor/hooks/use-create-arrival.ts';
import { useCreateDeparture } from '@/features/departure-editor/hooks/use-create-departure.ts';
import {
  buildStockDecreaseAdjustmentInput,
  buildStockIncreaseAdjustmentInput,
} from '@/features/stock-adjustment/stock-adjustment.ts';
import type { StockDeparturePrefillState } from '@/features/stock-departure-prefill/stock-departure-prefill.ts';
import { useStockList } from '@/features/stocks-data/hooks/use-stock-list.ts';
import { useAppNavigate } from '@/router';
import { useActionFeedback } from '@/shared/ui/action-feedback';
import type { CollectionFilterMenuConfig } from '@/shared/ui/collection-section/types.ts';

import {
  STOCK_SUBJECT_KIND_LABELS,
  STOCK_SUBJECT_KIND_OPTIONS,
} from './stocks-page-formatters.ts';

type AdjustmentFormValues = {
  delta: number;
  reason: string;
};

export function useStocksPageState() {
  const createArrival = useCreateArrival();
  const createDeparture = useCreateDeparture();
  const navigate = useAppNavigate();
  const actionFeedback = useActionFeedback();
  const [searchValue, setSearchValue] = useState('');
  const [sortValue, setSortValue] = useState<string | null>('updatedAt-desc');
  const [inStockOnly, setInStockOnly] = useState(false);
  const [subjectKind, setSubjectKind] = useState<SubjectKind | null>(null);
  const [selectedStockId, setSelectedStockId] = useState<string | null>(null);
  const [adjustmentStockId, setAdjustmentStockId] = useState<string | null>(
    null
  );
  const [adjustmentError, setAdjustmentError] = useState<string | null>(null);
  const [isAdjustmentSubmitting, setIsAdjustmentSubmitting] = useState(false);

  const stocks = useStockList({
    filters: {
      search: searchValue,
      supplierId: null,
      productId: null,
      categoryId: null,
      subjectKind,
      inStockOnly,
    },
    sort:
      sortValue === 'balance-desc'
        ? { direction: 'desc', field: 'balance' }
        : sortValue === 'title-asc'
          ? { direction: 'asc', field: 'title' }
          : { direction: 'desc', field: 'updatedAt' },
    limit: null,
    offset: 0,
  });

  const selectedStock =
    selectedStockId === null
      ? null
      : (stocks.find((item) => item.id === selectedStockId) ?? null);
  const adjustmentStock =
    adjustmentStockId === null
      ? null
      : (stocks.find((item) => item.id === adjustmentStockId) ?? null);

  const adjustmentForm = useForm<AdjustmentFormValues>({
    initialValues: {
      delta: 0,
      reason: '',
    },
    mode: 'uncontrolled',
  });

  const filterMenu = useMemo<CollectionFilterMenuConfig>(
    () => ({
      triggerLabel: 'Фильтры',
      groups: [
        {
          key: 'balance',
          label: 'Баланс',
          items: [
            {
              checked: inStockOnly,
              closeMenuOnClick: false,
              key: 'in-stock-only',
              label: 'Только положительный остаток',
              onClick: () => setInStockOnly((current) => !current),
            },
          ],
        },
        {
          key: 'subject-kind',
          label: 'Тип позиции',
          items: [
            {
              key: 'subject-kind-root',
              label: subjectKind
                ? STOCK_SUBJECT_KIND_LABELS[subjectKind]
                : 'Все типы',
              onClick: () => undefined,
              submenu: [
                {
                  checked: subjectKind === null,
                  closeMenuOnClick: false,
                  key: 'subject-kind-all',
                  label: 'Все типы',
                  onClick: () => setSubjectKind(null),
                },
                ...STOCK_SUBJECT_KIND_OPTIONS.map((value) => ({
                  checked: subjectKind === value,
                  closeMenuOnClick: false,
                  key: `subject-kind-${value}`,
                  label: STOCK_SUBJECT_KIND_LABELS[value],
                  onClick: () => setSubjectKind(value),
                })),
              ],
            },
          ],
        },
      ],
    }),
    [inStockOnly, subjectKind]
  );

  function openAdjustmentModal(stockId: string): void {
    setAdjustmentError(null);
    adjustmentForm.setValues({
      delta: 0,
      reason: '',
    });
    setAdjustmentStockId(stockId);
  }

  function closeAdjustmentModal(): void {
    setAdjustmentStockId(null);
    setAdjustmentError(null);
  }

  async function handleAdjustmentSubmit(
    values: AdjustmentFormValues
  ): Promise<void> {
    if (adjustmentStock === null) {
      return;
    }

    const delta = Number(values.delta);
    const reason = values.reason.trim();

    if (!Number.isFinite(delta) || delta === 0) {
      const message = 'Укажите ненулевое изменение.';
      setAdjustmentError(message);
      actionFeedback.notify({
        kind: 'warning',
        message,
        title: 'Корректировка',
      });
      return;
    }

    if (reason === '') {
      const message = 'Укажите причину корректировки.';
      setAdjustmentError(message);
      actionFeedback.notify({
        kind: 'warning',
        message,
        title: 'Корректировка',
      });
      return;
    }

    if (delta < 0 && Math.abs(delta) > adjustmentStock.balance) {
      const message = 'Нельзя списать больше, чем текущий остаток.';
      setAdjustmentError(message);
      actionFeedback.notify({
        kind: 'warning',
        message,
        title: 'Корректировка',
      });
      return;
    }

    setAdjustmentError(null);
    setIsAdjustmentSubmitting(true);

    try {
      const result =
        delta > 0
          ? await createArrival.execute(
              buildStockIncreaseAdjustmentInput(adjustmentStock, delta, reason)
            )
          : await createDeparture.execute(
              buildStockDecreaseAdjustmentInput(
                adjustmentStock,
                Math.abs(delta),
                reason
              )
            );

      if (!result.ok) {
        const message =
          'Не удалось применить корректировку. Попробуйте ещё раз.';
        setAdjustmentError(message);
        actionFeedback.notify({
          kind: 'error',
          message,
          title: 'Корректировка',
        });
        return;
      }

      adjustmentForm.reset();
      closeAdjustmentModal();
      actionFeedback.notify({
        kind: 'success',
        message: 'Остаток скорректирован.',
        title: 'Корректировка',
      });
    } finally {
      setIsAdjustmentSubmitting(false);
    }
  }

  function openDetails(stockId: string): void {
    setSelectedStockId(stockId);
  }

  function closeDetails(): void {
    setSelectedStockId(null);
  }

  function openDepartureCreate(state: StockDeparturePrefillState): void {
    navigate.to('root.departures.create', { state });
  }

  return {
    adjustmentError,
    adjustmentForm,
    adjustmentStock,
    closeAdjustmentModal,
    closeDetails,
    filterMenu,
    handleAdjustmentSubmit,
    inStockOnly,
    isAdjustmentSubmitting,
    openAdjustmentModal,
    openDepartureCreate,
    openDetails,
    searchValue,
    selectedStock,
    setSearchValue,
    setSortValue,
    sortValue,
    stocks,
  };
}

export type StocksPageState = ReturnType<typeof useStocksPageState>;
