import { FORM_PREFERENCE_KEYS } from '@/features/form-preferences/model/form-preferences.keys.ts';

import type {
  ArrivalEditorMode,
  ArrivalEditorSectionName,
} from './arrival-form.types.ts';

export const ARRIVAL_EDITOR_COPY = {
  loading: 'Загружаем данные прихода…',
  notFound: 'Приход не найден.',
  operation: {
    draftFailed: 'Не удалось сохранить приход в черновик.',
    missingArrival: 'Не удалось определить приход для редактирования.',
    saved: 'Приход сохранён.',
    validationError: 'Проверьте заполнение формы.',
  },
  submit: {
    create: 'Создать',
    edit: 'Сохранить изменения',
  } satisfies Record<ArrivalEditorMode, string>,
  title: {
    create: 'Новый приход',
    edit: 'Редактирование прихода',
  } satisfies Record<ArrivalEditorMode, string>,
  validation: {
    amountInvalid: 'Сумма должна быть числом.',
    occurredAtRequired: 'Укажите дату и время прихода.',
    titleRequired: 'Укажите название прихода.',
  },
} as const;

export const ARRIVAL_FORM_SECTION_IDS: Record<
  ArrivalEditorSectionName,
  string
> = {
  additional: 'arrival-editor-section-additional',
  directories: 'arrival-editor-section-directories',
  main: 'arrival-editor-section-main',
};

export const ARRIVAL_FORM_PREFERENCE_KEYS = {
  categoryCreateIfMissing: FORM_PREFERENCE_KEYS.arrival.categoryCreateIfMissing,
  productCreateIfMissing: FORM_PREFERENCE_KEYS.arrival.productCreateIfMissing,
  subjectKind: FORM_PREFERENCE_KEYS.arrival.subjectKind,
  supplierCreateIfMissing: FORM_PREFERENCE_KEYS.arrival.supplierCreateIfMissing,
} as const;
