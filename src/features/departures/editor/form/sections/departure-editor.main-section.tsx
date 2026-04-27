import type { ReactElement } from 'react';
import { SimpleGrid, Stack } from '@mantine/core';
import type { UseFormReturnType } from '@mantine/form';
import { IconClipboardList, IconScan } from '@tabler/icons-react';

import { CodesFieldFamily } from '@/features/form-controls/codes';
import type { CodesFieldAction } from '@/features/form-controls/codes/field-family-codes.types.ts';
import { OccurredAtFieldFamily } from '@/features/form-controls/date-time';
import { MoneyFieldFamily } from '@/features/form-controls/money';
import { DepartureModeFieldFamily } from '@/features/form-fields/field-family-departure-mode';
import { SubjectKindFieldFamily } from '@/features/form-fields/field-family-subject-kind';
import { TitleFieldFamily } from '@/features/form-fields/field-family-title';
import { FieldInfoTrigger } from '@/features/form-controls/support/field-info-trigger';
import { FormSectionCard } from '@/shared/ui/form-shell';

import { DEPARTURE_FORM_PREFERENCE_KEYS } from '../model/departure-editor.form-constants.ts';
import { countDepartureCodes } from '../model/departure-editor.form-mappers.ts';
import type { DepartureEditorFormValues } from '../model/departure-editor.form-values.ts';

interface DepartureMainSectionProps {
  bufferItemCount: number;
  form: UseFormReturnType<DepartureEditorFormValues>;
  occurredAtValue: string;
  onOccurredAtChange: (value: string) => void;
  onOpenBufferPicker: () => void;
  onOpenScanner: () => void;
}

export function DepartureMainSection({
  bufferItemCount,
  form,
  occurredAtValue,
  onOccurredAtChange,
  onOpenBufferPicker,
  onOpenScanner,
}: Readonly<DepartureMainSectionProps>): ReactElement {
  const codeActions: CodesFieldAction[] = [
    {
      icon: IconScan,
      iconOnly: true,
      label: 'Открыть сканер',
      onClick: onOpenScanner,
      testId: 'departure-open-scanner-button',
    },
    {
      compact: true,
      icon: IconClipboardList,
      label: 'Выбрать из буфера',
      onClick: onOpenBufferPicker,
      testId: 'departure-open-buffer-picker-button',
    },
  ];

  return (
    <FormSectionCard
      title={
        <span>
          Основное <FieldInfoTrigger contentKey="section.main.departure" />
        </span>
      }
    >
      <Stack gap="xs">
        <TitleFieldFamily form={form} path="title" />
        <CodesFieldFamily
          actions={codeActions}
          codeKindPath="codeKind"
          codeSummary={`${countDepartureCodes(form.getValues().codes)} кодов, буфер ${bufferItemCount}`}
          codesPath="codes"
          form={form}
        />
        <SimpleGrid cols={{ base: 1, xs: 2 }} spacing="xs">
          <OccurredAtFieldFamily
            form={form}
            onChange={onOccurredAtChange}
            path="occurredAt"
            testId="departure-occurred-at-picker"
            value={occurredAtValue}
          />
          <SubjectKindFieldFamily
            form={form}
            path="subjectKind"
            preferenceKey={DEPARTURE_FORM_PREFERENCE_KEYS.subjectKind}
          />
        </SimpleGrid>
        <DepartureModeFieldFamily
          form={form}
          path="mode"
          preferenceKey={DEPARTURE_FORM_PREFERENCE_KEYS.mode}
        />
        <MoneyFieldFamily
          amountPath="amount"
          currencyPath="currency"
          form={form}
        />
      </Stack>
    </FormSectionCard>
  );
}
