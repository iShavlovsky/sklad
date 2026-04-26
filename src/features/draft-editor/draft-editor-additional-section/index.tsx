import type { ReactElement } from 'react';
import { Button, Collapse, Stack, Textarea, TextInput } from '@mantine/core';
import type { UseFormReturnType } from '@mantine/form';

import type { RecordKind } from '@/domain/common/record-kinds.ts';
import { FormSectionCard } from '@/shared/ui/form-shell';

import type { DraftEditorFormValues } from '../draft-editor.types.ts';

interface DraftEditorAdditionalSectionProps {
  form: UseFormReturnType<DraftEditorFormValues>;
  isOpen: boolean;
  kind: RecordKind;
  onToggle: () => void;
}

export function DraftEditorAdditionalSection({
  form,
  isOpen,
  kind,
  onToggle,
}: Readonly<DraftEditorAdditionalSectionProps>): ReactElement {
  return (
    <FormSectionCard title="Дополнительно">
      <Button onClick={onToggle} type="button" variant="subtle">
        {isOpen ? 'Скрыть редкие поля' : 'Показать редкие поля'}
      </Button>
      <Collapse expanded={isOpen}>
        <Stack gap="sm" mt="sm">
          {kind === 'arrival' ? (
            <TextInput
              key={form.key('linkUrl')}
              label="Ссылка"
              placeholder="https://..."
              {...form.getInputProps('linkUrl')}
            />
          ) : (
            <TextInput
              key={form.key('direction')}
              label="Направление"
              placeholder="Куда, кому, источник"
              {...form.getInputProps('direction')}
            />
          )}
          <Textarea
            key={form.key('note')}
            label="Заметка"
            minRows={2}
            {...form.getInputProps('note')}
          />
        </Stack>
      </Collapse>
    </FormSectionCard>
  );
}
