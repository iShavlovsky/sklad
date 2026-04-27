import type { ReactElement } from 'react';
import { SimpleGrid, Stack } from '@mantine/core';
import type { UseFormReturnType } from '@mantine/form';

import { CodesFieldFamily } from '@/features/form-controls/codes';
import { OccurredAtFieldFamily } from '@/features/form-controls/date-time';
import { MoneyFieldFamily } from '@/features/form-controls/money';
import { FieldInfoTrigger } from '@/features/form-controls/support/field-info-trigger';
import { DepartureModeFieldFamily } from '@/features/form-fields/field-family-departure-mode';
import { SubjectKindFieldFamily } from '@/features/form-fields/field-family-subject-kind';
import { TitleFieldFamily } from '@/features/form-fields/field-family-title';
import { FormSectionCard } from '@/shared/ui/form-shell';

import { DraftKindField } from '../fields/draft-editor.kind-field.tsx';
import { DRAFT_FORM_PREFERENCE_KEYS } from '../model/draft-editor.form-constants.ts';
import type {
  DraftEditorFormValues,
  DraftEditorMode,
} from '../model/draft-editor.form-values.ts';

interface DraftMainSectionProps {
  form: UseFormReturnType<DraftEditorFormValues>;
  mode: DraftEditorMode;
  occurredAtValue: string;
  onOccurredAtChange: (value: string) => void;
}

export function DraftMainSection({
  form,
  mode,
  occurredAtValue,
  onOccurredAtChange,
}: Readonly<DraftMainSectionProps>): ReactElement {
  const { kind } = form.values;

  return (
    <FormSectionCard
      title={
        <span>
          Основное <FieldInfoTrigger contentKey="section.main.draft" />
        </span>
      }
    >
      <Stack gap="xs">
        <DraftKindField
          isReadonly={mode === 'edit'}
          kind={kind}
          onKindChange={(value) => {
            form.setFieldValue('kind', value);
          }}
        />
        <TitleFieldFamily form={form} path="title" />
        <CodesFieldFamily
          codeKindPath="codeKind"
          codesPath="codes"
          form={form}
        />
        <SimpleGrid cols={{ base: 1, xs: 2 }} spacing="xs">
          <OccurredAtFieldFamily
            form={form}
            onChange={onOccurredAtChange}
            path="occurredAt"
            value={occurredAtValue}
          />
          <SubjectKindFieldFamily
            form={form}
            path="subjectKind"
            preferenceKey={DRAFT_FORM_PREFERENCE_KEYS.subjectKind}
          />
        </SimpleGrid>
        <MoneyFieldFamily
          amountPath="amount"
          currencyPath="currency"
          form={form}
        />
        {kind === 'departure' ? (
          <DepartureModeFieldFamily
            form={form}
            path="departureMode"
            preferenceKey={DRAFT_FORM_PREFERENCE_KEYS.departureMode}
          />
        ) : null}
      </Stack>
    </FormSectionCard>
  );
}
