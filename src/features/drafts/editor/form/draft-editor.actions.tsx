import type { ReactElement } from 'react';
import { Button } from '@mantine/core';

import { FormStickyActions } from '@/shared/ui/form-shell';

type DraftEditorFormActionsProps = {
  isSubmitting: boolean;
  onCancel: () => void;
};

export function DraftEditorFormActions({
  isSubmitting,
  onCancel,
}: Readonly<DraftEditorFormActionsProps>): ReactElement {
  return (
    <FormStickyActions
      primaryAction={
        <Button loading={isSubmitting} size="sm" type="submit">
          Сохранить
        </Button>
      }
      secondaryAction={
        <Button onClick={onCancel} size="sm" type="button" variant="default">
          К списку черновиков
        </Button>
      }
    />
  );
}
