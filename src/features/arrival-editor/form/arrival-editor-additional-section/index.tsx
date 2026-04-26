import type { ReactElement } from 'react';
import { Button, Collapse, Group, Textarea, TextInput } from '@mantine/core';
import type { UseFormReturnType } from '@mantine/form';

import { FormSectionCard } from '@/shared/ui/form-shell';

import type { ArrivalEditorFormValues } from '../arrival-editor.types.ts';

interface ArrivalEditorAdditionalSectionProps {
  form: UseFormReturnType<ArrivalEditorFormValues>;
  isOpen: boolean;
  onToggle: () => void;
}

export function ArrivalEditorAdditionalSection({
  form,
  isOpen,
  onToggle,
}: Readonly<ArrivalEditorAdditionalSectionProps>): ReactElement {
  return (
    <FormSectionCard title="Дополнительно">
      <Button onClick={onToggle} type="button" variant="subtle">
        {isOpen ? 'Скрыть редкие поля' : 'Показать редкие поля'}
      </Button>
      <Collapse expanded={isOpen}>
        <Group mt="sm" wrap="wrap">
          <TextInput
            key={form.key('linkUrl')}
            label="Ссылка"
            placeholder="https://..."
            {...form.getInputProps('linkUrl')}
          />
        </Group>
        <Textarea
          key={form.key('note')}
          label="Заметка"
          minRows={2}
          mt="sm"
          {...form.getInputProps('note')}
        />
      </Collapse>
    </FormSectionCard>
  );
}
