import { ARRIVAL_EDITOR_COPY } from './arrival-form.constants.ts';
import { parseArrivalAmount } from './arrival-form.mappers.ts';
import type { ArrivalEditorFormValues } from './arrival-form.types.ts';

export function validateArrivalForm(
  values: ArrivalEditorFormValues
): Record<string, string | null> {
  return {
    amount:
      values.amount.trim() !== '' && parseArrivalAmount(values.amount) === null
        ? ARRIVAL_EDITOR_COPY.validation.amountInvalid
        : null,
    occurredAt:
      values.occurredAt.trim() === ''
        ? ARRIVAL_EDITOR_COPY.validation.occurredAtRequired
        : null,
    title:
      values.title.trim() === ''
        ? ARRIVAL_EDITOR_COPY.validation.titleRequired
        : null,
  };
}
