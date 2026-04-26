import type { DepartureDraftPayload } from '../../../domain/drafts/departure-draft.payload.ts';
import type { CreateDepartureInput } from '../../../domain/entries/departure/create/create-departure.input.ts';
import type { CreateDepartureResult } from '../../../domain/entries/departure/create/create-departure.result.ts';
import type { ArrivalDetails } from '../../../domain/queries/arrival/arrival-details.query.ts';
import { nowIso } from '../../../shared/utils/time.ts';

import type {
  DepartureEditorDirectoryValue,
  DepartureEditorFormValues,
} from './departure-editor.types.ts';

function emptyDirectoryValue(): DepartureEditorDirectoryValue {
  return {
    id: '',
    name: '',
    createIfMissing: false,
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
    id: normalizeString(field.id),
    name: normalizeString(field.name),
    createIfMissing: field.createIfMissing,
  };
}

export function createEmptyDepartureEditorValues(): DepartureEditorFormValues {
  return {
    title: '',
    subjectKind: 'other',
    description: '',
    occurredAt: formatIsoForDateTimePicker(nowIso()),
    amount: '',
    currency: 'RUB',
    note: '',
    direction: '',
    supplier: emptyDirectoryValue(),
    product: emptyDirectoryValue(),
    category: emptyDirectoryValue(),
    mode: 'loss',
    basedOnArrivalId: '',
    codes: '',
    codeKind: 'custom',
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
    title: values.title.trim(),
    subjectKind: values.subjectKind,
    description: normalizeString(values.description),
    occurredAt: normalizeOccurredAtValue(values.occurredAt),
    money: {
      amount: parseDepartureAmount(values.amount),
      currency: normalizeString(values.currency),
    },
    note: normalizeString(values.note),
    direction: normalizeString(values.direction),
    supplier: buildDirectoryInput(values.supplier),
    product: buildDirectoryInput(values.product),
    category: buildDirectoryInput(values.category),
    mode: values.mode,
    basedOnArrivalId: normalizeString(values.basedOnArrivalId),
    codes: splitDepartureCodes(values.codes).map((value) => ({
      value,
      kind: values.codeKind,
    })),
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
    title: common.title,
    subjectKind: common.subjectKind,
    description: common.description,
    occurredAt: common.occurredAt,
    money: common.money,
    note: common.note,
    direction: common.direction,
    supplier: {
      id: common.supplier.id,
      name: common.supplier.name,
    },
    product: {
      id: common.product.id,
      name: common.product.name,
    },
    category: {
      id: common.category.id,
      name: common.category.name,
    },
    mode: common.mode,
    basedOnArrivalId: common.basedOnArrivalId,
    codes: common.codes,
  };
}

export function applyLinkedArrivalToDepartureValues(
  current: DepartureEditorFormValues,
  details: ArrivalDetails
): DepartureEditorFormValues {
  return {
    ...current,
    title: details.arrival.title,
    subjectKind: details.arrival.subjectKind,
    description: details.arrival.description ?? '',
    amount:
      details.arrival.amount === null
        ? current.amount
        : String(details.arrival.amount),
    currency: details.arrival.currency ?? current.currency,
    supplier: {
      id: details.arrival.supplierId ?? '',
      name: details.arrival.supplierName ?? '',
      createIfMissing: false,
    },
    product: {
      id: details.arrival.productId ?? '',
      name: details.arrival.productName ?? '',
      createIfMissing: false,
    },
    category: {
      id: details.arrival.categoryId ?? '',
      name: details.arrival.categoryName ?? '',
      createIfMissing: false,
    },
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
