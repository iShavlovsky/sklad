import { useState } from 'react';
import { useForm } from '@mantine/form';

import type { StockListItem } from '@/domain/queries/stock/stock-list.item.ts';
import { useCreateArrival } from '@/features/arrivals/editor/hooks/use-create-arrival.ts';
import { useCreateDeparture } from '@/features/departures/editor/hooks/use-create-departure.ts';
import {
  buildStockDecreaseAdjustmentInput,
  buildStockIncreaseAdjustmentInput,
} from '@/features/stocks/adjustment/stock-adjustment.ts';
import type { StockDeparturePrefillState } from '@/features/stocks/departure-prefill/stock-departure-prefill.ts';
import { useAppNavigate } from '@/router';
import { useActionFeedback } from '@/shared/ui/action-feedback';

type AdjustmentFormValues = {
  delta: number;
  reason: string;
};

interface StocksPageWorkflowInput {
  stocks: StockListItem[];
}

export function useStocksPageWorkflow({ stocks }: StocksPageWorkflowInput) {
  const createArrival = useCreateArrival();
  const createDeparture = useCreateDeparture();
  const navigate = useAppNavigate();
  const actionFeedback = useActionFeedback();
  const [adjustmentStockId, setAdjustmentStockId] = useState<string | null>(
    null
  );
  const [adjustmentError, setAdjustmentError] = useState<string | null>(null);
  const [isAdjustmentSubmitting, setIsAdjustmentSubmitting] = useState(false);

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

  function openDepartureCreate(state: StockDeparturePrefillState): void {
    navigate.to('root.departures.create', { state });
  }

  return {
    adjustmentError,
    adjustmentForm,
    adjustmentStock,
    closeAdjustmentModal,
    handleAdjustmentSubmit,
    isAdjustmentSubmitting,
    openAdjustmentModal,
    openDepartureCreate,
  };
}

export type StocksPageWorkflowState = ReturnType<typeof useStocksPageWorkflow>;
