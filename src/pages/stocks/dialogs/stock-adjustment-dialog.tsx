import type { ReactElement } from 'react';
import {
  Alert,
  Button,
  Modal,
  NumberInput,
  Stack,
  Text,
  TextInput,
} from '@mantine/core';

import type { StocksPageState } from '../lib/use-stocks-page-state.ts';

interface StockAdjustmentDialogProps {
  state: StocksPageState;
}

export function StockAdjustmentDialog({
  state,
}: Readonly<StockAdjustmentDialogProps>): ReactElement {
  return (
    <Modal
      onClose={state.closeAdjustmentModal}
      opened={state.adjustmentStock !== null}
      title="Корректировка остатка"
    >
      {state.adjustmentStock ? (
        <form
          onSubmit={state.adjustmentForm.onSubmit(state.handleAdjustmentSubmit)}
        >
          <Stack gap="md">
            <Text fw={700}>{state.adjustmentStock.title}</Text>
            <Text c="dimmed" size="sm">
              Баланс: {state.adjustmentStock.balance} шт.
            </Text>
            <Text c="dimmed" size="sm">
              Отрицательное значение создаст отгрузка, положительное создаст
              приход.
            </Text>
            {state.adjustmentError ? (
              <Alert color="red" variant="light">
                {state.adjustmentError}
              </Alert>
            ) : null}
            <NumberInput
              decimalScale={0}
              label="Изменение количества"
              step={1}
              thousandSeparator={false}
              {...state.adjustmentForm.getInputProps('delta')}
            />
            <TextInput
              label="Причина"
              {...state.adjustmentForm.getInputProps('reason')}
            />
            <Button loading={state.isAdjustmentSubmitting} type="submit">
              Применить корректировку
            </Button>
          </Stack>
        </form>
      ) : null}
    </Modal>
  );
}
