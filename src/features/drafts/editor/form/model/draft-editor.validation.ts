import type { DraftEditorFormValues } from './draft-editor.form-values.ts';

export function validateDraftForm(
  values: DraftEditorFormValues
): Record<string, string | null> {
  return {
    amount:
      values.amount.trim() !== '' &&
      Number.isNaN(Number(values.amount.replace(',', '.')))
        ? 'Сумма должна быть числом.'
        : null,
    occurredAt:
      values.occurredAt.trim() === '' ? 'Укажите дату и время.' : null,
    title: values.title.trim() === '' ? 'Укажите название черновика.' : null,
  };
}
