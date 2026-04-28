import type { RecordCodeKind } from '@/domain/common/record-kinds.ts';
import type { DepartureDraftPayload } from '@/domain/drafts/departure-draft.payload.ts';
import type { CreateDepartureInput } from '@/domain/entries/departure/create/create-departure.input.ts';
import type { CreateDepartureResult } from '@/domain/entries/departure/create/create-departure.result.ts';
import type { ArrivalDetails } from '@/domain/queries/arrival/arrival-details.query.ts';
import { formatIsoForDateTimePicker } from '@/features/form-controls/date-time/field-family-occurred-at.format.ts';
import { readRememberedFormPreference } from '@/features/form-preferences/model/form-preferences.store.ts';
import { nowIso } from '@/shared/utils/time.ts';

import { DEPARTURE_FORM_PREFERENCE_KEYS } from './departure-editor.form-constants.ts';
import type {
  DepartureEditorDirectoryValue,
  DepartureEditorFormValues,
} from './departure-editor.form-values.ts';

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

export { formatIsoForDateTimePicker };

function normalizeOccurredAtValue(raw: string): string {
  const trimmed = raw.trim();
  if (trimmed === '') {
    return trimmed;
  }

  const candidate = trimmed.includes('T') ? trimmed : trimmed.replace(' ', 'T');
  const parsed = new Date(candidate);
  return Number.isNaN(parsed.getTime()) ? trimmed : parsed.toISOString();
}

function formatAutoTitleDate(normalizedOccurredAt: string): string | null {
  if (normalizedOccurredAt.trim() === '') {
    return null;
  }

  const parsed = new Date(normalizedOccurredAt);
  return Number.isNaN(parsed.getTime())
    ? null
    : new Intl.DateTimeFormat('ru-RU').format(parsed);
}

function resolveAutoDepartureTitle(
  values: DepartureEditorFormValues,
  normalizedOccurredAt: string
): string {
  const explicitTitle = normalizeString(values.title);
  if (explicitTitle !== null) {
    return explicitTitle;
  }

  const subjectName =
    normalizeString(values.product.name) ??
    normalizeString(values.supplier.name) ??
    normalizeString(values.category.name);
  const date = formatAutoTitleDate(normalizedOccurredAt);

  return ['Отгрузка', subjectName, date].filter(Boolean).join(' · ');
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
    quantity: '',
    subjectKind: readRememberedFormPreference(
      DEPARTURE_FORM_PREFERENCE_KEYS.subjectKind,
      'other'
    ),
    supplier: emptyDirectoryValue(),
    title: '',
    totalCost: '',
    unitCost: '',
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

export function parseDepartureDecimal(raw: string): number | null {
  const trimmed = raw.trim();
  if (trimmed === '') return null;

  const parsed = Number(trimmed.replace(',', '.'));
  return Number.isFinite(parsed) ? parsed : null;
}

export function formatDepartureDecimal(value: number): string {
  return Number.isInteger(value) ? String(value) : value.toFixed(2);
}

function buildCommonDepartureInput(values: DepartureEditorFormValues) {
  const quantity = parseDepartureDecimal(values.quantity);
  const totalCost = parseDepartureDecimal(values.totalCost);
  const unitCost = parseDepartureDecimal(values.unitCost);
  const occurredAt = normalizeOccurredAtValue(values.occurredAt);

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
      amount: totalCost ?? quantity ?? parseDepartureAmount(values.amount),
      currency: normalizeString(values.currency),
    },
    quantityCost: {
      quantity,
      totalCost,
      unitCost,
    },
    note: normalizeString(values.note),
    occurredAt,
    product: buildDirectoryInput(values.product),
    subjectKind: values.subjectKind,
    supplier: buildDirectoryInput(values.supplier),
    title: resolveAutoDepartureTitle(values, occurredAt),
  };
}

function appendLinkedArrivalCodes(
  currentCodesRaw: string,
  linkedCodes: ArrivalDetails['codes']
): string {
  const currentCodes = splitDepartureCodes(currentCodesRaw);
  const seen = new Set(currentCodes);
  const nextCodes = [...currentCodes];

  for (const linkedCode of linkedCodes) {
    const value = linkedCode.value.trim();
    if (value === '' || seen.has(value)) {
      continue;
    }

    seen.add(value);
    nextCodes.push(value);
  }

  return nextCodes.join('\n');
}

function resolveLinkedArrivalCodeKind(
  current: DepartureEditorFormValues,
  linkedCodes: ArrivalDetails['codes']
): RecordCodeKind {
  if (
    splitDepartureCodes(current.codes).length > 0 ||
    linkedCodes.length === 0
  ) {
    return current.codeKind;
  }

  const [firstCode] = linkedCodes;
  if (!firstCode) {
    return current.codeKind;
  }

  return linkedCodes.every((code) => code.kind === firstCode.kind)
    ? firstCode.kind
    : current.codeKind;
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
    quantityCost: common.quantityCost,
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
  const nextCodes = appendLinkedArrivalCodes(current.codes, details.codes);

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
    codeKind: resolveLinkedArrivalCodeKind(current, details.codes),
    codes: nextCodes,
    description: details.arrival.description ?? '',
    product: {
      createIfMissing: false,
      id: details.arrival.productId ?? '',
      name: details.arrival.productName ?? '',
    },
    quantity:
      details.arrival.quantity === null
        ? current.quantity
        : String(details.arrival.quantity),
    subjectKind: details.arrival.subjectKind,
    supplier: {
      createIfMissing: false,
      id: details.arrival.supplierId ?? '',
      name: details.arrival.supplierName ?? '',
    },
    title: details.arrival.title,
    totalCost:
      details.arrival.totalCost === null
        ? current.totalCost
        : String(details.arrival.totalCost),
    unitCost:
      details.arrival.unitCost === null
        ? current.unitCost
        : String(details.arrival.unitCost),
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
      return 'Не удалось сохранить отгрузку. Попробуйте ещё раз.';
  }
}
