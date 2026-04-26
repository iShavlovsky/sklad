import type { RecordCodeKind } from '../../../domain/common/record-kinds.ts';
import type { ArrivalDraftPayload } from '../../../domain/drafts/arrival-draft.payload.ts';
import type { CreateArrivalDirectoryInput } from '../../../domain/entries/arrival/create/create-arrival.input.ts';
import type { CreateArrivalInput } from '../../../domain/entries/arrival/create/create-arrival.input.ts';
import type { UpdateArrivalInput } from '../../../domain/entries/arrival/update/update-arrival.input.ts';
import type { ArrivalDetails } from '../../../domain/queries/arrival/arrival-details.query.ts';
import { nowIso } from '../../../shared/utils/time.ts';

import type {
  ArrivalEditorDirectoryValue,
  ArrivalEditorFormValues,
} from './arrival-editor.types.ts';

function emptyDirectoryValue(): ArrivalEditorDirectoryValue {
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

export function createEmptyArrivalEditorValues(): ArrivalEditorFormValues {
  return {
    title: '',
    subjectKind: 'other',
    description: '',
    occurredAt: formatIsoForDateTimePicker(nowIso()),
    amount: '',
    currency: 'RUB',
    linkUrl: '',
    note: '',
    supplier: emptyDirectoryValue(),
    product: emptyDirectoryValue(),
    category: emptyDirectoryValue(),
    codes: '',
    codeKind: 'custom',
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
    title: details.arrival.title,
    subjectKind: details.arrival.subjectKind,
    description: details.arrival.description ?? '',
    occurredAt: formatIsoForDateTimePicker(details.arrival.occurredAt),
    amount:
      details.arrival.amount === null ? '' : String(details.arrival.amount),
    currency: details.arrival.currency ?? '',
    linkUrl: details.arrival.linkUrl ?? '',
    note: details.arrival.note ?? '',
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
    codes: details.codes.map((code) => code.value).join('\n'),
    codeKind: inferArrivalCodeKind(details.codes),
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
    id: normalizeString(field.id),
    name: normalizeString(field.name),
    createIfMissing: field.createIfMissing,
  };
}

function buildCommonArrivalInput(values: ArrivalEditorFormValues) {
  return {
    title: values.title.trim(),
    subjectKind: values.subjectKind,
    description: normalizeString(values.description),
    occurredAt: normalizeOccurredAtValue(values.occurredAt),
    money: {
      amount: parseArrivalAmount(values.amount),
      currency: normalizeString(values.currency),
    },
    linkUrl: normalizeString(values.linkUrl),
    note: normalizeString(values.note),
    supplier: buildArrivalDirectoryInput(values.supplier),
    product: buildArrivalDirectoryInput(values.product),
    category: buildArrivalDirectoryInput(values.category),
    codes: splitArrivalCodes(values.codes).map((value) => ({
      value,
      kind: values.codeKind,
    })),
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
    title: common.title,
    subjectKind: common.subjectKind,
    description: common.description,
    occurredAt: common.occurredAt,
    money: common.money,
    linkUrl: common.linkUrl,
    note: common.note,
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
    codes: common.codes,
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
