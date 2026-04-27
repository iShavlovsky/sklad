import type { ReactElement } from 'react';
import { Button } from '@mantine/core';

import { formActionButtonPresets } from '@/app/theme/components/button.theme';
import { FormStickyActions } from '@/shared/ui/form-shell';

import { ARRIVAL_EDITOR_COPY } from './model/arrival-editor.form-constants.ts';
import type { ArrivalEditorMode } from './model/arrival-editor.form-values.ts';

type ArrivalEditorFormActionsProps = {
  mode: ArrivalEditorMode;
  pendingAction: 'create' | 'draft' | null;
  onCancel: () => void;
  onSaveDraft: () => void;
};

export function ArrivalEditorFormActions({
  mode,
  onCancel,
  onSaveDraft,
  pendingAction,
}: Readonly<ArrivalEditorFormActionsProps>): ReactElement {
  return (
    <FormStickyActions
      primaryAction={
        <Button
          {...formActionButtonPresets.create}
          loading={pendingAction === 'create'}
          type="submit"
        >
          {mode === 'create' ? 'Создать' : ARRIVAL_EDITOR_COPY.submit[mode]}
        </Button>
      }
      secondaryAction={
        mode === 'create' ? (
          <Button
            {...formActionButtonPresets.save}
            loading={pendingAction === 'draft'}
            onClick={onSaveDraft}
            type="button"
          >
            Сохранить
          </Button>
        ) : undefined
      }
    >
      <Button
        {...formActionButtonPresets.cancel}
        onClick={onCancel}
        type="button"
      >
        {mode === 'create' ? 'Отмена' : 'К списку приходов'}
      </Button>
    </FormStickyActions>
  );
}
