import type { ReactElement } from 'react';
import { SimpleGrid, Stack } from '@mantine/core';
import type { UseFormReturnType } from '@mantine/form';
import { IconClipboardList } from '@tabler/icons-react';

import { ARRIVAL_FORM_PREFERENCE_KEYS } from '@/features/arrival-editor/form/model/arrival-form.constants.ts';
import type { ArrivalEditorFormValues } from '@/features/arrival-editor/form/model/arrival-form.types.ts';
import { CodesFieldFamily } from '@/features/form-fields/field-family-codes';
import type { CodesFieldAction } from '@/features/form-fields/field-family-codes/field-family-codes.types.ts';
import { MoneyFieldFamily } from '@/features/form-fields/field-family-money';
import { OccurredAtFieldFamily } from '@/features/form-fields/field-family-occurred-at';
import { SubjectKindFieldFamily } from '@/features/form-fields/field-family-subject-kind';
import { TitleFieldFamily } from '@/features/form-fields/field-family-title';
import { FieldInfoTrigger } from '@/features/form-fields/field-info-trigger';
import { FormSectionCard } from '@/shared/ui/form-shell';

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

  return (
    <FormSectionCard
      title={
        <span>
          Основное <FieldInfoTrigger contentKey="section.main.arrival" />
        </span>
      }
    >
      <Stack gap="xs">
        <TitleFieldFamily form={form} path="title" />
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
        <MoneyFieldFamily
          amountPath="amount"
          currencyPath="currency"
          form={form}
        />
      </Stack>
    </FormSectionCard>
  );
}
