import type { ReactElement } from 'react';
import { SimpleGrid, Stack } from '@mantine/core';
import type { UseFormReturnType } from '@mantine/form';
import { IconClipboardList } from '@tabler/icons-react';

import { ARRIVAL_FORM_PREFERENCE_KEYS } from '@/features/arrivals/editor/form/model/arrival-editor.form-constants.ts';
import type { ArrivalEditorFormValues } from '@/features/arrivals/editor/form/model/arrival-editor.form-values.ts';
import { CodesFieldFamily } from '@/features/form-controls/codes';
import type { CodesFieldAction } from '@/features/form-controls/codes/field-family-codes.types.ts';
import { OccurredAtFieldFamily } from '@/features/form-controls/date-time';
import { QuantityCostFieldFamily } from '@/features/form-controls/quantity-cost';
import { FieldInfoTrigger } from '@/features/form-controls/support/field-info-trigger';
import { SubjectKindFieldFamily } from '@/features/form-fields/field-family-subject-kind';
import { FormSectionCard } from '@/shared/ui/form-shell';

import {
  formatArrivalDecimal,
  parseArrivalDecimal,
} from '../model/arrival-editor.form-mappers.ts';

interface ArrivalMainSectionProps {
  bufferItemCount: number;
  form: UseFormReturnType<ArrivalEditorFormValues>;
  occurredAtValue: string;
  onOccurredAtChange: (value: string) => void;
  onOpenBufferPicker: () => void;
}

export function ArrivalMainSection({
  bufferItemCount,
  form,
  occurredAtValue,
  onOccurredAtChange,
  onOpenBufferPicker,
}: Readonly<ArrivalMainSectionProps>): ReactElement {
  const codeActions: CodesFieldAction[] = [
    {
      compact: true,
      icon: IconClipboardList,
      label: 'Выбрать из буфера',
      onClick: onOpenBufferPicker,
    },
  ];

  function handleQuantityChange(value: string): void {
    form.setFieldValue('quantity', value);
    const quantity = parseArrivalDecimal(value);
    const totalCost = parseArrivalDecimal(form.getValues().totalCost);
    const unitCost = parseArrivalDecimal(form.getValues().unitCost);

    if (quantity !== null && quantity > 0 && totalCost !== null) {
      form.setFieldValue(
        'unitCost',
        formatArrivalDecimal(totalCost / quantity)
      );
      return;
    }

    if (quantity !== null && unitCost !== null) {
      form.setFieldValue(
        'totalCost',
        formatArrivalDecimal(quantity * unitCost)
      );
    }
  }

  function handleTotalCostChange(value: string): void {
    form.setFieldValue('totalCost', value);
    const quantity = parseArrivalDecimal(form.getValues().quantity);
    const totalCost = parseArrivalDecimal(value);

    if (quantity !== null && quantity > 0 && totalCost !== null) {
      form.setFieldValue(
        'unitCost',
        formatArrivalDecimal(totalCost / quantity)
      );
    }
  }

  function handleUnitCostChange(value: string): void {
    form.setFieldValue('unitCost', value);
    const quantity = parseArrivalDecimal(form.getValues().quantity);
    const unitCost = parseArrivalDecimal(value);

    if (quantity !== null && unitCost !== null) {
      form.setFieldValue(
        'totalCost',
        formatArrivalDecimal(quantity * unitCost)
      );
    }
  }

  return (
    <FormSectionCard
      title={
        <span>
          Основное <FieldInfoTrigger contentKey="section.main.arrival" />
        </span>
      }
    >
      <Stack gap="xs">
        <CodesFieldFamily
          actions={codeActions}
          codeKindPath="codeKind"
          codeSummary={
            bufferItemCount > 0 ? `В буфере ${bufferItemCount}` : 'Буфер пуст'
          }
          codesPath="codes"
          form={form}
        />
        <SimpleGrid cols={{ base: 1, xs: 2 }} spacing="xs">
          <OccurredAtFieldFamily
            form={form}
            onChange={onOccurredAtChange}
            path="occurredAt"
            testId="arrival-occurred-at-picker"
            value={occurredAtValue}
          />
          <SubjectKindFieldFamily
            form={form}
            path="subjectKind"
            preferenceKey={ARRIVAL_FORM_PREFERENCE_KEYS.subjectKind}
          />
        </SimpleGrid>
        <QuantityCostFieldFamily
          currencyPath="currency"
          form={form}
          onQuantityChange={handleQuantityChange}
          onTotalCostChange={handleTotalCostChange}
          onUnitCostChange={handleUnitCostChange}
          quantityPath="quantity"
          totalCostPath="totalCost"
          unitCostPath="unitCost"
        />
      </Stack>
    </FormSectionCard>
  );
}
