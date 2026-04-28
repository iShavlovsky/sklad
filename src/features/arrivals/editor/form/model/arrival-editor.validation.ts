import { ARRIVAL_EDITOR_COPY } from './arrival-editor.form-constants.ts';
import { parseArrivalDecimal } from './arrival-editor.form-mappers.ts';
import type { ArrivalEditorFormValues } from './arrival-editor.form-values.ts';

export function validateArrivalForm(
  values: ArrivalEditorFormValues
): Record<string, string | null> {
  return {
    quantity:
      values.quantity.trim() !== '' &&
      parseArrivalDecimal(values.quantity) === null
        ? ARRIVAL_EDITOR_COPY.validation.quantityInvalid
        : null,
    totalCost:
      values.totalCost.trim() !== '' &&
      parseArrivalDecimal(values.totalCost) === null
        ? ARRIVAL_EDITOR_COPY.validation.costInvalid
        : null,
    unitCost:
      values.unitCost.trim() !== '' &&
      parseArrivalDecimal(values.unitCost) === null
        ? ARRIVAL_EDITOR_COPY.validation.costInvalid
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
