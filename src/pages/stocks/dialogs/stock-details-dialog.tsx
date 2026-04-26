import type { ReactElement } from 'react';
import { Badge, Drawer, Stack, Text } from '@mantine/core';

import type { StocksPageState } from '../lib/use-stocks-page-state.ts';

interface StockDetailsDialogProps {
  state: StocksPageState;
}

export function StockDetailsDialog({
  state,
}: Readonly<StockDetailsDialogProps>): ReactElement {
  return (
    <Drawer
      onClose={state.closeDetails}
      opened={state.selectedStock !== null}
      padding="md"
      position="bottom"
      radius="md"
      size="md"
      title="Детали остатка"
    >
      {state.selectedStock ? (
        <Stack gap="sm">
          <Text fw={700}>{state.selectedStock.title}</Text>
          <Text c="dimmed" size="sm">
            Баланс: {state.selectedStock.balance} шт.
          </Text>
          {state.selectedStock.availableCodes.map((code) => (
            <Badge key={code} size="lg" variant="light">
              {code}
            </Badge>
          ))}
        </Stack>
      ) : null}
    </Drawer>
  );
}
