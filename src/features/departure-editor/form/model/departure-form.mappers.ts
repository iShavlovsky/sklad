import type { DepartureDraftPayload } from '@/domain/drafts/departure-draft.payload.ts';
import type { CreateDepartureInput } from '@/domain/entries/departure/create/create-departure.input.ts';
import type { CreateDepartureResult } from '@/domain/entries/departure/create/create-departure.result.ts';
import type { ArrivalDetails } from '@/domain/queries/arrival/arrival-details.query.ts';
import { readRememberedFormPreference } from '@/features/form-preferences/model/form-preferences.store.ts';
import { nowIso } from '@/shared/utils/time.ts';

import { DEPARTURE_FORM_PREFERENCE_KEYS } from './departure-form.constants.ts';
import type {
  DepartureEditorDirectoryValue,
  DepartureEditorFormValues,
} from './departure-form.types.ts';

function emptyDirectoryValue(): DepartureEditorDirectoryValue {
  return {
    createIfMissing: false,
    id: '',
    name: '',
  };
}

function normalizeString(raw: string): string | null {
  const trimmed = raw.trim();
  return trimmed === '' ? null : trimmed;
}

function padDateTimePart(value: number): string {
  return String(value).padStart(2, '0');
}

export function formatIsoForDateTimePicker(raw: string): string {
  const parsed = new Date(raw);
  if (Number.isNaN(parsed.getTime())) {
    return raw;
  }

  return (
    [
      parsed.getFullYear(),
      padDateTimePart(parsed.getMonth() + 1),
      padDateTimePart(parsed.getDate()),
    ].join('-') +
    ` ${padDateTimePart(parsed.getHours())}:${padDateTimePart(parsed.getMinutes())}:00`
  );
}

function normalizeOccurredAtValue(raw: string): string {
  const trimmed = raw.trim();
  if (trimmed === '') {
    return trimmed;
  }

  const candidate = trimmed.includes('T') ? trimmed : trimmed.replace(' ', 'T');
  const parsed = new Date(candidate);
  return Number.isNaN(parsed.getTime()) ? trimmed : parsed.toISOString();
}

function buildDirectoryInput(field: DepartureEditorDirectoryValue) {
  return {
    createIfMissing: field.createIfMissing,
    id: normalizeString(field.id),
    name: normalizeString(field.name),
  };
}

export function createEmptyDepartureEditorValues(): DepartureEditorFormValues {
  return {
    amount: '',
    basedOnArrivalId: '',
    category: emptyDirectoryValue(),
    codeKind: 'custom',
    codes: '',
    currency: 'RUB',
    description: '',
    direction: '',
    mode: readRememberedFormPreference(
      DEPARTURE_FORM_PREFERENCE_KEYS.mode,
      'loss'
    ),
    note: '',
    occurredAt: formatIsoForDateTimePicker(nowIso()),
    product: emptyDirectoryValue(),
    subjectKind: readRememberedFormPreference(
      DEPARTURE_FORM_PREFERENCE_KEYS.subjectKind,
      'other'
    ),
    supplier: emptyDirectoryValue(),
    title: '',
  };
}

export function applyDepartureCreatePreferences(
  values: DepartureEditorFormValues
): DepartureEditorFormValues {
  return {
    ...values,
    category: {
      ...values.category,
      createIfMissing: readRememberedFormPreference(
        DEPARTURE_FORM_PREFERENCE_KEYS.categoryCreateIfMissing,
        values.category.createIfMissing
      ),
    },
    mode: readRememberedFormPreference(
      DEPARTURE_FORM_PREFERENCE_KEYS.mode,
      values.mode
    ),
    product: {
      ...values.product,
      createIfMissing: readRememberedFormPreference(
        DEPARTURE_FORM_PREFERENCE_KEYS.productCreateIfMissing,
        values.product.createIfMissing
      ),
    },
    subjectKind: readRememberedFormPreference(
      DEPARTURE_FORM_PREFERENCE_KEYS.subjectKind,
      values.subjectKind
    ),
    supplier: {
      ...values.supplier,
      createIfMissing: readRememberedFormPreference(
        DEPARTURE_FORM_PREFERENCE_KEYS.supplierCreateIfMissing,
        values.supplier.createIfMissing
      ),
    },
  };
}

export function splitDepartureCodes(raw: string): string[] {
  return raw
    .split(/[\n,;]/)
    .map((value) => value.trim())
    .filter(Boolean);
}

export function countDepartureCodes(raw: string): number {
  return splitDepartureCodes(raw).length;
}

export function parseDepartureAmount(raw: string): number | null {
  const trimmed = raw.trim();
  if (trimmed === '') return null;

  const parsed = Number(trimmed.replace(',', '.'));
  return Number.isFinite(parsed) ? parsed : null;
}

function buildCommonDepartureInput(values: DepartureEditorFormValues) {
  return {
    basedOnArrivalId: normalizeString(values.basedOnArrivalId),
    category: buildDirectoryInput(values.category),
    codes: splitDepartureCodes(values.codes).map((value) => ({
      kind: values.codeKind,
      value,
    })),
    description: normalizeString(values.description),
    direction: normalizeString(values.direction),
    mode: values.mode,
    money: {
      amount: parseDepartureAmount(values.amount),
      currency: normalizeString(values.currency),
    },
    note: normalizeString(values.note),
    occurredAt: normalizeOccurredAtValue(values.occurredAt),
    product: buildDirectoryInput(values.product),
    subjectKind: values.subjectKind,
    supplier: buildDirectoryInput(values.supplier),
    title: values.title.trim(),
  };
}

export function buildCreateDepartureInput(
  values: DepartureEditorFormValues
): CreateDepartureInput {
  return {
    ...buildCommonDepartureInput(values),
    originDraftId: null,
  };
}

export function buildDepartureDraftPayload(
  values: DepartureEditorFormValues
): DepartureDraftPayload {
  const common = buildCommonDepartureInput(values);

  return {
    basedOnArrivalId: common.basedOnArrivalId,
    category: {
      id: common.category.id,
      name: common.category.name,
    },
    codes: common.codes,
    description: common.description,
    direction: common.direction,
    mode: common.mode,
    money: common.money,
    note: common.note,
    occurredAt: common.occurredAt,
    product: {
      id: common.product.id,
      name: common.product.name,
    },
    subjectKind: common.subjectKind,
    supplier: {
      id: common.supplier.id,
      name: common.supplier.name,
    },
    title: common.title,
  };
}

export function applyLinkedArrivalToDepartureValues(
  current: DepartureEditorFormValues,
  details: ArrivalDetails
): DepartureEditorFormValues {
  return {
    ...current,
    amount:
      details.arrival.amount === null
        ? current.amount
        : String(details.arrival.amount),
    category: {
      createIfMissing: false,
      id: details.arrival.categoryId ?? '',
      name: details.arrival.categoryName ?? '',
    },
    description: details.arrival.description ?? '',
    product: {
      createIfMissing: false,
      id: details.arrival.productId ?? '',
      name: details.arrival.productName ?? '',
    },
    subjectKind: details.arrival.subjectKind,
    supplier: {
      createIfMissing: false,
      id: details.arrival.supplierId ?? '',
      name: details.arrival.supplierName ?? '',
    },
    title: details.arrival.title,
  };
}

export function getCreateDepartureOperationMessage(
  result: Exclude<CreateDepartureResult, { ok: true }>
): string {
  switch (result.code) {
    case 'VALIDATION_ERROR':
      return 'Проверьте заполнение формы.';
    case 'LINKED_ARRIVAL_RESOLVE_FAILED':
      return 'Связанный приход не найден. Обновите выбор и повторите попытку.';
    case 'SUPPLIER_RESOLVE_FAILED':
      return result.reason === 'creation-not-confirmed'
        ? 'Поставщик не подтверждён для создания.'
        : 'Не удалось определить поставщика.';
    case 'PRODUCT_RESOLVE_FAILED':
      return result.reason === 'creation-not-confirmed'
        ? 'Товар не подтверждён для создания.'
        : 'Не удалось определить товар.';
    case 'CATEGORY_RESOLVE_FAILED':
      return result.reason === 'creation-not-confirmed'
        ? 'Категория не подтверждена для создания.'
        : 'Не удалось определить категорию.';
    case 'DB_WRITE_FAILED':
    default:
      return 'Не удалось сохранить расход. Попробуйте ещё раз.';
  }
}
