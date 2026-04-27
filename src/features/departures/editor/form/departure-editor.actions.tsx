import type { ReactElement } from 'react';
import { Button } from '@mantine/core';

import { formActionButtonPresets } from '@/app/theme/components/button.theme';
import { FormStickyActions } from '@/shared/ui/form-shell';

type DepartureEditorFormActionsProps = {
  pendingAction: 'create' | 'draft' | null;
  onCancel: () => void;
  onSaveDraft: () => void;
};

export function DepartureEditorFormActions({
  onCancel,
  onSaveDraft,
  pendingAction,
}: Readonly<DepartureEditorFormActionsProps>): ReactElement {
  return (
    <FormStickyActions
      primaryAction={
        <Button
          {...formActionButtonPresets.create}
          loading={pendingAction === 'create'}
          type="submit"
        >
          Создать
        </Button>
      }
      secondaryAction={
        <Button
          {...formActionButtonPresets.save}
          loading={pendingAction === 'draft'}
          onClick={onSaveDraft}
          type="button"
        >
          Сохранить
        </Button>
      }
    >
      <Button
        {...formActionButtonPresets.cancel}
        onClick={onCancel}
        type="button"
      >
        Отмена
      </Button>
    </FormStickyActions>
  );
}
