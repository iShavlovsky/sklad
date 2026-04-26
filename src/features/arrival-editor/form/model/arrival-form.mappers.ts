import type { RecordCodeKind } from '@/domain/common/record-kinds.ts';
import type { ArrivalDraftPayload } from '@/domain/drafts/arrival-draft.payload.ts';
import type { CreateArrivalDirectoryInput } from '@/domain/entries/arrival/create/create-arrival.input.ts';
import type { CreateArrivalInput } from '@/domain/entries/arrival/create/create-arrival.input.ts';
import type { UpdateArrivalInput } from '@/domain/entries/arrival/update/update-arrival.input.ts';
import type { ArrivalDetails } from '@/domain/queries/arrival/arrival-details.query.ts';
import { readRememberedFormPreference } from '@/features/form-preferences/model/form-preferences.store.ts';
import { nowIso } from '@/shared/utils/time.ts';

import { ARRIVAL_FORM_PREFERENCE_KEYS } from './arrival-form.constants.ts';
import type {
  ArrivalEditorDirectoryValue,
  ArrivalEditorFormValues,
} from './arrival-form.types.ts';

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
    subjectKind: readRememberedFormPreference(
      ARRIVAL_FORM_PREFERENCE_KEYS.subjectKind,
      'other'
    ),
    supplier: emptyDirectoryValue(),
    title: '',
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
    subjectKind: details.arrival.subjectKind,
    supplier: {
      createIfMissing: false,
      id: details.arrival.supplierId ?? '',
      name: details.arrival.supplierName ?? '',
    },
    title: details.arrival.title,
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
  return {
    category: buildArrivalDirectoryInput(values.category),
    codes: splitArrivalCodes(values.codes).map((value) => ({
      kind: values.codeKind,
      value,
    })),
    description: normalizeString(values.description),
    linkUrl: normalizeString(values.linkUrl),
    money: {
      amount: parseArrivalAmount(values.amount),
      currency: normalizeString(values.currency),
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
