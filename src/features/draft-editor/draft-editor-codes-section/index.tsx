import type { ReactElement } from 'react';
import { Select, Stack } from '@mantine/core';
import type { UseFormReturnType } from '@mantine/form';

import type { RecordCodeKind } from '@/domain/common/record-kinds.ts';
import { FormSectionCard } from '@/shared/ui/form-shell';
import { SerialTokensInput } from '@/shared/ui/serial-tokens-input';

import { DRAFT_EDITOR_CODE_KIND_OPTIONS } from '../draft-editor.constants.ts';
import type { DraftEditorFormValues } from '../draft-editor.types.ts';

interface DraftEditorCodesSectionProps {
  form: UseFormReturnType<DraftEditorFormValues>;
}

export function DraftEditorCodesSection({
  form,
}: Readonly<DraftEditorCodesSectionProps>): ReactElement {
  return (
    <FormSectionCard title="Коды">
      <Stack gap="sm">
        <Select
          data={[...DRAFT_EDITOR_CODE_KIND_OPTIONS]}
          label="Тип кода"
          onChange={(value) => {
            form.setFieldValue(
              'codeKind',
              (value as RecordCodeKind) ?? 'custom'
            );
          }}
          value={form.values.codeKind}
        />
        <SerialTokensInput
          onChange={(value) => {
            form.setFieldValue('codes', value);
          }}
          value={form.values.codes}
        />
      </Stack>
    </FormSectionCard>
  );
}
