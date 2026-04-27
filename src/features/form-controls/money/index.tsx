import type { ReactElement } from 'react';
import { Group, NumberInput, TextInput } from '@mantine/core';

import { FieldLabel } from '@/features/form-controls/support/field-info-trigger';
import { getFieldPlaceholder } from '@/features/form-controls/support/field-metadata/field-metadata.helpers.ts';
import { FieldInlineIcon } from '@/shared/ui/field-visuals';

import {
  MONEY_AMOUNT_FIELD_METADATA,
  MONEY_CURRENCY_FIELD_METADATA,
} from './field-family-money.constants.ts';
import type { MoneyFieldFamilyProps } from './field-family-money.types.ts';

export function MoneyFieldFamily<TValues>({
  amountMetadata = MONEY_AMOUNT_FIELD_METADATA,
  amountPath,
  currencyMetadata = MONEY_CURRENCY_FIELD_METADATA,
  currencyPath,
  form,
}: Readonly<MoneyFieldFamilyProps<TValues>>): ReactElement {
  const values = form.getValues() as Record<string, unknown>;

  return (
    <Group align="flex-start" grow wrap="wrap">
      <NumberInput
        decimalScale={2}
        error={form.errors[amountPath]}
        hideControls
        label={<FieldLabel metadata={amountMetadata} />}
        leftSection={<FieldInlineIcon field="amount" />}
        onChange={(value) => {
          form.setFieldValue(
            amountPath,
            (value === '' || value === null ? '' : String(value)) as never
          );
        }}
        placeholder={getFieldPlaceholder(amountMetadata)}
        value={values[amountPath] as string | number | undefined}
      />
      <TextInput
        key={form.key(currencyPath)}
        label={<FieldLabel metadata={currencyMetadata} />}
        leftSection={<FieldInlineIcon field="currency" />}
        placeholder={getFieldPlaceholder(currencyMetadata)}
        {...form.getInputProps(currencyPath)}
      />
    </Group>
  );
}
