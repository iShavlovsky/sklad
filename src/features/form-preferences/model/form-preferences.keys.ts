import type { FormPreferenceKey } from './form-preferences.types.ts';

export const FORM_PREFERENCE_KEYS = {
  arrival: {
    categoryCreateIfMissing: 'arrival.category.createIfMissing',
    productCreateIfMissing: 'arrival.product.createIfMissing',
    subjectKind: 'arrival.subjectKind',
    supplierCreateIfMissing: 'arrival.supplier.createIfMissing',
  },
  departure: {
    categoryCreateIfMissing: 'departure.category.createIfMissing',
    mode: 'departure.mode',
    productCreateIfMissing: 'departure.product.createIfMissing',
    subjectKind: 'departure.subjectKind',
    supplierCreateIfMissing: 'departure.supplier.createIfMissing',
  },
  draft: {
    departureMode: 'draft.departureMode',
    kind: 'draft.kind',
    subjectKind: 'draft.subjectKind',
  },
} as const satisfies Record<string, Record<string, FormPreferenceKey>>;
