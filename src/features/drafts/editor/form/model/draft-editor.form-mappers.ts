import type { RecordCodeKind } from '@/domain/common/record-kinds.ts';
import type { ArrivalDraftPayload } from '@/domain/drafts/arrival-draft.payload.ts';
import type { DepartureDraftPayload } from '@/domain/drafts/departure-draft.payload.ts';
import type { DraftPayload } from '@/domain/drafts/draft.payload.ts';
import type { ArrivalDetails } from '@/domain/queries/arrival/arrival-details.query.ts';
import type { DraftDetails } from '@/domain/queries/draft/draft-details.query.ts';
import { formatIsoForDateTimePicker } from '@/features/form-controls/date-time/field-family-occurred-at.format.ts';
import { readRememberedFormPreference } from '@/features/form-preferences/model/form-preferences.store.ts';

import { DRAFT_FORM_PREFERENCE_KEYS } from './draft-editor.form-constants.ts';
import type { DraftEditorFormValues } from './draft-editor.form-values.ts';

export function createEmptyDraftValues(): DraftEditorFormValues {
  return {
    amount: '',
    basedOnArrivalId: '',
    categoryId: '',
    categoryName: '',
    codeKind: 'custom',
    codes: '',
    currency: 'RUB',
    departureMode: readRememberedFormPreference(
      DRAFT_FORM_PREFERENCE_KEYS.departureMode,
      'loss'
    ),
    description: '',
    direction: '',
    kind: readRememberedFormPreference(
      DRAFT_FORM_PREFERENCE_KEYS.kind,
      'arrival'
    ),
    linkUrl: '',
    note: '',
    occurredAt: formatIsoForDateTimePicker(new Date().toISOString()),
    productId: '',
    productName: '',
    subjectKind: readRememberedFormPreference(
      DRAFT_FORM_PREFERENCE_KEYS.subjectKind,
      'other'
    ),
    supplierId: '',
    supplierName: '',
    title: '',
  };
}

export function splitCodes(
  raw: string
): Array<{ value: string; kind: RecordCodeKind }> {
  return raw
    .split(/[\n,;]/)
    .map((value) => value.trim())
    .filter(Boolean)
    .map((value) => ({
      kind: 'custom' as RecordCodeKind,
      value,
    }));
}

export function normalizeAmount(raw: string): number | null {
  const trimmed = raw.trim();
  if (trimmed === '') return null;
  const parsed = Number(trimmed.replace(',', '.'));
  return Number.isFinite(parsed) ? parsed : null;
}

export function normalizeOccurredAt(raw: string): string | null {
  const trimmed = raw.trim();
  if (trimmed === '') return null;
  const candidate = trimmed.includes('T') ? trimmed : trimmed.replace(' ', 'T');
  const parsed = new Date(candidate);
  return Number.isNaN(parsed.getTime()) ? trimmed : parsed.toISOString();
}

export function mapDraftDetailsToValues(
  details: DraftDetails
): DraftEditorFormValues {
  const { payload } = details.draft;
  const baseValues: DraftEditorFormValues = {
    amount: payload.money.amount === null ? '' : String(payload.money.amount),
    basedOnArrivalId: '',
    categoryId: payload.category.id ?? '',
    categoryName: payload.category.name ?? '',
    codeKind: details.codes[0]?.kind ?? 'custom',
    codes: details.codes.map((code) => code.value).join('\n'),
    currency: payload.money.currency ?? 'RUB',
    departureMode: 'loss',
    description: payload.description ?? '',
    direction: '',
    kind: details.draft.kind,
    linkUrl: '',
    note: payload.note ?? '',
    occurredAt: formatIsoForDateTimePicker(
      payload.occurredAt ?? new Date().toISOString()
    ),
    productId: payload.product.id ?? '',
    productName: payload.product.name ?? '',
    subjectKind: payload.subjectKind,
    supplierId: payload.supplier.id ?? '',
    supplierName: payload.supplier.name ?? '',
    title: details.draft.title,
  };

  if (details.draft.kind === 'arrival') {
    return {
      ...baseValues,
      linkUrl: (payload as ArrivalDraftPayload).linkUrl ?? '',
    };
  }

  const departurePayload = payload as DepartureDraftPayload;
  return {
    ...baseValues,
    basedOnArrivalId: departurePayload.basedOnArrivalId ?? '',
    departureMode: departurePayload.mode,
    direction: departurePayload.direction ?? '',
  };
}

export function buildDraftPayload(values: DraftEditorFormValues): DraftPayload {
  const amount = normalizeAmount(values.amount);
  const currency =
    values.currency.trim() === '' ? null : values.currency.trim();
  const hasCurrency = currency !== null;

  const basePayload = {
    category: {
      id: values.categoryId.trim() === '' ? null : values.categoryId.trim(),
      name:
        values.categoryName.trim() === '' ? null : values.categoryName.trim(),
    },
    codes: splitCodes(values.codes).map((code) => ({
      ...code,
      kind: values.codeKind,
    })),
    description:
      values.description.trim() === '' ? null : values.description.trim(),
    money: {
      amount,
      currency,
    },
    quantityCost: {
      quantity: !hasCurrency ? amount : null,
      totalCost: hasCurrency ? amount : null,
      unitCost: null,
    },
    note: values.note.trim() === '' ? null : values.note.trim(),
    occurredAt: normalizeOccurredAt(values.occurredAt),
    product: {
      id: values.productId.trim() === '' ? null : values.productId.trim(),
      name: values.productName.trim() === '' ? null : values.productName.trim(),
    },
    subjectKind: values.subjectKind,
    supplier: {
      id: values.supplierId.trim() === '' ? null : values.supplierId.trim(),
      name:
        values.supplierName.trim() === '' ? null : values.supplierName.trim(),
    },
    title: values.title.trim(),
  };

  if (values.kind === 'arrival') {
    return {
      ...basePayload,
      linkUrl: values.linkUrl.trim() === '' ? null : values.linkUrl.trim(),
    };
  }

  return {
    ...basePayload,
    basedOnArrivalId:
      values.basedOnArrivalId.trim() === ''
        ? null
        : values.basedOnArrivalId.trim(),
    direction: values.direction.trim() === '' ? null : values.direction.trim(),
    mode: values.departureMode,
  };
}

export function applyLinkedArrivalToDraftValues(
  current: DraftEditorFormValues,
  details: ArrivalDetails
): DraftEditorFormValues {
  return {
    ...current,
    amount:
      details.arrival.amount === null
        ? current.amount
        : String(details.arrival.amount),
    categoryId: details.arrival.categoryId ?? '',
    categoryName: details.arrival.categoryName ?? '',
    description: details.arrival.description ?? '',
    productId: details.arrival.productId ?? '',
    productName: details.arrival.productName ?? '',
    subjectKind: details.arrival.subjectKind,
    supplierId: details.arrival.supplierId ?? '',
    supplierName: details.arrival.supplierName ?? '',
    title: details.arrival.title,
  };
}

export function getPublishErrorMessage(code: string): string {
  switch (code) {
    case 'PUBLISH_TARGET_INVALID':
      return 'Тип черновика не совпадает с целевым publish flow.';
    case 'DRAFT_NOT_FOUND':
      return 'Черновик не найден.';
    case 'TARGET_RESOLUTION_FAILED':
      return 'Не удалось опубликовать черновик в целевую запись.';
    case 'VALIDATION_ERROR':
      return 'Проверьте заполнение черновика перед публикацией.';
    default:
      return 'Не удалось опубликовать черновик.';
  }
}
