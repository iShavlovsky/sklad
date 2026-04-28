import type { ReactElement } from 'react';
import { Group, NumberInput, TextInput } from '@mantine/core';
import type { UseFormReturnType } from '@mantine/form';

import { FieldInlineIcon } from '@/shared/ui/field-visuals';

export interface QuantityCostFieldFamilyProps<TValues> {
  currencyPath: string;
  form: UseFormReturnType<TValues>;
  onQuantityChange: (value: string) => void;
  onTotalCostChange: (value: string) => void;
  onUnitCostChange: (value: string) => void;
  quantityPath: string;
  totalCostPath: string;
  unitCostPath: string;
}

function stringifyNumberInput(value: string | number): string {
  return value === '' || value === null ? '' : String(value);
}

export function QuantityCostFieldFamily<TValues>({
  currencyPath,
  form,
  onQuantityChange,
  onTotalCostChange,
  onUnitCostChange,
  quantityPath,
  totalCostPath,
  unitCostPath,
}: Readonly<QuantityCostFieldFamilyProps<TValues>>): ReactElement {
  const values = form.getValues() as Record<string, unknown>;

  return (
    <Group align="flex-start" grow wrap="wrap">
      <NumberInput
        decimalScale={3}
        error={form.errors[quantityPath]}
        hideControls
        label="Количество"
        leftSection={<FieldInlineIcon field="amount" />}
        onChange={(value) => onQuantityChange(stringifyNumberInput(value))}
        placeholder="1"
        value={values[quantityPath] as string | number | undefined}
      />
      <NumberInput
        decimalScale={2}
        error={form.errors[totalCostPath]}
        hideControls
        label="Общая стоимость"
        leftSection={<FieldInlineIcon field="amount" />}
        onChange={(value) => onTotalCostChange(stringifyNumberInput(value))}
        placeholder="0"
        value={values[totalCostPath] as string | number | undefined}
      />
      <NumberInput
        decimalScale={2}
        error={form.errors[unitCostPath]}
        hideControls
        label="Цена за единицу"
        leftSection={<FieldInlineIcon field="amount" />}
        onChange={(value) => onUnitCostChange(stringifyNumberInput(value))}
        placeholder="0"
        value={values[unitCostPath] as string | number | undefined}
      />
      <TextInput
        key={form.key(currencyPath)}
        label="Валюта"
        leftSection={<FieldInlineIcon field="currency" />}
        placeholder="RUB"
        {...form.getInputProps(currencyPath)}
      />
    </Group>
  );
}
