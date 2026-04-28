import { DEPARTURE_EDITOR_COPY } from './departure-editor.form-constants.ts';
import { parseDepartureDecimal } from './departure-editor.form-mappers.ts';
import type { DepartureEditorFormValues } from './departure-editor.form-values.ts';

export function validateDepartureForm(
  values: DepartureEditorFormValues
): Record<string, string | null> {
  return {
    quantity:
      values.quantity.trim() !== '' &&
      parseDepartureDecimal(values.quantity) === null
        ? DEPARTURE_EDITOR_COPY.validation.quantityInvalid
        : null,
    totalCost:
      values.totalCost.trim() !== '' &&
      parseDepartureDecimal(values.totalCost) === null
        ? DEPARTURE_EDITOR_COPY.validation.costInvalid
        : null,
    unitCost:
      values.unitCost.trim() !== '' &&
      parseDepartureDecimal(values.unitCost) === null
        ? DEPARTURE_EDITOR_COPY.validation.costInvalid
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
