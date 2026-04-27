import { DEPARTURE_EDITOR_COPY } from './departure-editor.form-constants.ts';
import { parseDepartureAmount } from './departure-editor.form-mappers.ts';
import type { DepartureEditorFormValues } from './departure-editor.form-values.ts';

export function validateDepartureForm(
  values: DepartureEditorFormValues
): Record<string, string | null> {
  return {
    amount:
      values.amount.trim() !== '' &&
      parseDepartureAmount(values.amount) === null
        ? DEPARTURE_EDITOR_COPY.validation.amountInvalid
        : null,
    occurredAt:
      values.occurredAt.trim() === ''
        ? DEPARTURE_EDITOR_COPY.validation.occurredAtRequired
        : null,
    title:
      values.title.trim() === ''
        ? DEPARTURE_EDITOR_COPY.validation.titleRequired
        : null,
  };
}
