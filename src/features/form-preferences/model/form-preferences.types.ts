export type FormPreferenceValue = string | boolean;

export interface FormPreferencesPersistedState {
  values: Partial<Record<FormPreferenceKey, FormPreferenceValue>>;
}

export interface FormPreferencesState extends FormPreferencesPersistedState {
  rememberValue: (key: FormPreferenceKey, value: FormPreferenceValue) => void;
  forgetValue: (key: FormPreferenceKey) => void;
}

export type FormPreferenceKey =
  | 'arrival.subjectKind'
  | 'arrival.supplier.createIfMissing'
  | 'arrival.product.createIfMissing'
  | 'arrival.category.createIfMissing'
  | 'departure.mode'
  | 'departure.subjectKind'
  | 'departure.supplier.createIfMissing'
  | 'departure.product.createIfMissing'
  | 'departure.category.createIfMissing'
  | 'draft.kind'
  | 'draft.subjectKind'
  | 'draft.departureMode';
