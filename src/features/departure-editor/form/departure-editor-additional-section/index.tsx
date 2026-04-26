import type { ReactElement } from 'react';
import { Button, Collapse, Textarea } from '@mantine/core';
import type { UseFormReturnType } from '@mantine/form';

import { FormSectionCard } from '@/shared/ui/form-shell';

import type { DepartureEditorFormValues } from '../departure-editor.types.ts';

interface DepartureEditorAdditionalSectionProps {
  form: UseFormReturnType<DepartureEditorFormValues>;
  isOpen: boolean;
  onToggle: () => void;
}

export function DepartureEditorAdditionalSection({
  form,
  isOpen,
  onToggle,
}: Readonly<DepartureEditorAdditionalSectionProps>): ReactElement {
  return (
    <FormSectionCard title="Дополнительно">
      <Button onClick={onToggle} type="button" variant="subtle">
        {isOpen ? 'Скрыть заметку' : 'Показать заметку'}
      </Button>
      <Collapse expanded={isOpen}>
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
