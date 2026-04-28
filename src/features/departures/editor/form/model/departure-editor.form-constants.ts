import { FORM_PREFERENCE_KEYS } from '@/features/form-preferences/model/form-preferences.keys.ts';

import type { DepartureEditorSectionName } from './departure-editor.form-values.ts';

export const DEPARTURE_EDITOR_COPY = {
  created: 'Отгрузка создана.',
  operation: {
    bufferUnavailable:
      'Не удалось открыть буфер. Проверьте, что верхняя панель доступна, и попробуйте ещё раз.',
    draftFailed: 'Не удалось сохранить отгрузку в черновик.',
    scannerUnavailable:
      'Не удалось открыть сканер. Проверьте, что верхняя панель доступна, и попробуйте ещё раз.',
    validationError: 'Проверьте заполнение формы.',
  },
  validation: {
    costInvalid: 'Стоимость должна быть числом.',
    occurredAtRequired: 'Укажите дату и время отгрузки.',
    quantityInvalid: 'Количество должно быть числом.',
    titleRequired: 'Укажите название отгрузки.',
  },
} as const;

export const DEPARTURE_FORM_SECTION_IDS: Record<
  DepartureEditorSectionName,
  string
> = {
  additional: 'departure-editor-section-additional',
  directories: 'departure-editor-section-directories',
  main: 'departure-editor-section-main',
  relation: 'departure-editor-section-relation',
};

export const DEPARTURE_FORM_PREFERENCE_KEYS = {
  categoryCreateIfMissing:
    FORM_PREFERENCE_KEYS.departure.categoryCreateIfMissing,
  mode: FORM_PREFERENCE_KEYS.departure.mode,
  productCreateIfMissing: FORM_PREFERENCE_KEYS.departure.productCreateIfMissing,
  subjectKind: FORM_PREFERENCE_KEYS.departure.subjectKind,
  supplierCreateIfMissing:
    FORM_PREFERENCE_KEYS.departure.supplierCreateIfMissing,
} as const;
