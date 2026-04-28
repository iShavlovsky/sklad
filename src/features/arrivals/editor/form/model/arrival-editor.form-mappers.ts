import type { RecordCodeKind } from '@/domain/common/record-kinds.ts';
import type { ArrivalDraftPayload } from '@/domain/drafts/arrival-draft.payload.ts';
import type { CreateArrivalDirectoryInput } from '@/domain/entries/arrival/create/create-arrival.input.ts';
import type { CreateArrivalInput } from '@/domain/entries/arrival/create/create-arrival.input.ts';
import type { UpdateArrivalInput } from '@/domain/entries/arrival/update/update-arrival.input.ts';
import type { ArrivalDetails } from '@/domain/queries/arrival/arrival-details.query.ts';
import { formatIsoForDateTimePicker } from '@/features/form-controls/date-time/field-family-occurred-at.format.ts';
import { readRememberedFormPreference } from '@/features/form-preferences/model/form-preferences.store.ts';
import { nowIso } from '@/shared/utils/time.ts';

import { ARRIVAL_FORM_PREFERENCE_KEYS } from './arrival-editor.form-constants.ts';
import type {
  ArrivalEditorDirectoryValue,
  ArrivalEditorFormValues,
} from './arrival-editor.form-values.ts';

function emptyDirectoryValue(): ArrivalEditorDirectoryValue {
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

export function createEmptyArrivalEditorValues(): ArrivalEditorFormValues {
  return {
    amount: '',
    category: emptyDirectoryValue(),
    codeKind: 'custom',
    codes: '',
    currency: 'RUB',
    description: '',
    linkUrl: '',
    note: '',
    occurredAt: formatIsoForDateTimePicker(nowIso()),
    product: emptyDirectoryValue(),
    quantity: '',
    subjectKind: readRememberedFormPreference(
      ARRIVAL_FORM_PREFERENCE_KEYS.subjectKind,
      'other'
    ),
    supplier: emptyDirectoryValue(),
    title: '',
    totalCost: '',
    unitCost: '',
  };
}

export function applyArrivalCreatePreferences(
  values: ArrivalEditorFormValues
): ArrivalEditorFormValues {
  return {
    ...values,
    category: {
      ...values.category,
      createIfMissing: readRememberedFormPreference(
        ARRIVAL_FORM_PREFERENCE_KEYS.categoryCreateIfMissing,
        values.category.createIfMissing
      ),
    },
    product: {
      ...values.product,
      createIfMissing: readRememberedFormPreference(
        ARRIVAL_FORM_PREFERENCE_KEYS.productCreateIfMissing,
        values.product.createIfMissing
      ),
    },
    subjectKind: readRememberedFormPreference(
      ARRIVAL_FORM_PREFERENCE_KEYS.subjectKind,
      values.subjectKind
    ),
    supplier: {
      ...values.supplier,
      createIfMissing: readRememberedFormPreference(
        ARRIVAL_FORM_PREFERENCE_KEYS.supplierCreateIfMissing,
        values.supplier.createIfMissing
      ),
    },
  };
}

export function inferArrivalCodeKind(
  codes: ArrivalDetails['codes']
): RecordCodeKind {
  if (codes.length === 0) return 'custom';

  const firstKind = codes[0]?.kind ?? 'custom';
  return codes.every((code) => code.kind === firstKind) ? firstKind : 'custom';
}

export function mapArrivalDetailsToEditorValues(
  details: ArrivalDetails
): ArrivalEditorFormValues {
  return {
    amount:
      details.arrival.amount === null ? '' : String(details.arrival.amount),
    category: {
      createIfMissing: false,
      id: details.arrival.categoryId ?? '',
      name: details.arrival.categoryName ?? '',
    },
    codeKind: inferArrivalCodeKind(details.codes),
    codes: details.codes.map((code) => code.value).join('\n'),
    currency: details.arrival.currency ?? '',
    description: details.arrival.description ?? '',
    linkUrl: details.arrival.linkUrl ?? '',
    note: details.arrival.note ?? '',
    occurredAt: formatIsoForDateTimePicker(details.arrival.occurredAt),
    product: {
      createIfMissing: false,
      id: details.arrival.productId ?? '',
      name: details.arrival.productName ?? '',
    },
    quantity:
      details.arrival.quantity === null ? '' : String(details.arrival.quantity),
    subjectKind: details.arrival.subjectKind,
    supplier: {
      createIfMissing: false,
      id: details.arrival.supplierId ?? '',
      name: details.arrival.supplierName ?? '',
    },
    title: details.arrival.title,
    totalCost:
      details.arrival.totalCost === null
        ? ''
        : String(details.arrival.totalCost),
    unitCost:
      details.arrival.unitCost === null ? '' : String(details.arrival.unitCost),
  };
}

export function splitArrivalCodes(raw: string): string[] {
  return raw
    .split(/[\n,;]/)
    .map((value) => value.trim())
    .filter(Boolean);
}

export function parseArrivalAmount(raw: string): number | null {
  const trimmed = raw.trim();
  if (trimmed === '') return null;

  const parsed = Number(trimmed.replace(',', '.'));
  return Number.isFinite(parsed) ? parsed : null;
}

export function parseArrivalDecimal(raw: string): number | null {
  const trimmed = raw.trim();
  if (trimmed === '') return null;

  const parsed = Number(trimmed.replace(',', '.'));
  return Number.isFinite(parsed) ? parsed : null;
}

export function formatArrivalDecimal(value: number): string {
  return Number.isInteger(value) ? String(value) : value.toFixed(2);
}

function buildArrivalDirectoryInput(
  field: ArrivalEditorDirectoryValue
): CreateArrivalDirectoryInput {
  return {
    createIfMissing: field.createIfMissing,
    id: normalizeString(field.id),
    name: normalizeString(field.name),
  };
}

function buildCommonArrivalInput(values: ArrivalEditorFormValues) {
  const quantity = parseArrivalDecimal(values.quantity);
  const totalCost = parseArrivalDecimal(values.totalCost);
  const unitCost = parseArrivalDecimal(values.unitCost);

  return {
    category: buildArrivalDirectoryInput(values.category),
    codes: splitArrivalCodes(values.codes).map((value) => ({
      kind: values.codeKind,
      value,
    })),
    description: normalizeString(values.description),
    linkUrl: normalizeString(values.linkUrl),
    money: {
      amount: totalCost ?? quantity ?? parseArrivalAmount(values.amount),
      currency: normalizeString(values.currency),
    },
    quantityCost: {
      quantity,
      totalCost,
      unitCost,
    },
    note: normalizeString(values.note),
    occurredAt: normalizeOccurredAtValue(values.occurredAt),
    product: buildArrivalDirectoryInput(values.product),
    subjectKind: values.subjectKind,
    supplier: buildArrivalDirectoryInput(values.supplier),
    title: values.title.trim(),
  };
}

export function buildCreateArrivalInput(
  values: ArrivalEditorFormValues
): CreateArrivalInput {
  return {
    ...buildCommonArrivalInput(values),
    originDraftId: null,
  };
}

export function buildArrivalDraftPayload(
  values: ArrivalEditorFormValues
): ArrivalDraftPayload {
  const common = buildCommonArrivalInput(values);

  return {
    category: {
      id: common.category.id,
      name: common.category.name,
    },
    codes: common.codes,
    description: common.description,
    linkUrl: common.linkUrl,
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

export function buildUpdateArrivalInput(
  id: string,
  values: ArrivalEditorFormValues
): UpdateArrivalInput {
  return {
    id,
    ...buildCommonArrivalInput(values),
  };
}
