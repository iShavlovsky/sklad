import type {
  RecordCodeKind,
  SubjectKind,
} from '@/domain/common/record-kinds.ts';

import type { ArrivalEditorMode } from './arrival-editor.types.ts';

export const ARRIVAL_EDITOR_SUBJECT_KIND_OPTIONS: Array<{
  label: string;
  value: SubjectKind;
}> = [
  { label: 'Товар', value: 'product' },
  { label: 'Деньги', value: 'money' },
  { label: 'Зарплата', value: 'salary' },
  { label: 'Кэшбэк', value: 'cashback' },
  { label: 'Платёж', value: 'payment' },
  { label: 'Другое', value: 'other' },
];

export const ARRIVAL_EDITOR_CODE_KIND_OPTIONS: Array<{
  label: string;
  value: RecordCodeKind;
}> = [
  { label: 'QR', value: 'qr' },
  { label: 'Штрихкод', value: 'barcode' },
  { label: 'Поставщик', value: 'vendor' },
  { label: 'Произвольный', value: 'custom' },
];

export const ARRIVAL_EDITOR_COPY = {
  eyebrow: 'Приходы',
  title: {
    create: 'Новый приход',
    edit: 'Редактирование прихода',
  } satisfies Record<ArrivalEditorMode, string>,
  intro: {
    create: 'Создайте новый приход и сохраните его в локальной базе.',
    edit: 'Обновите приход и замените связанные коды при сохранении.',
  } satisfies Record<ArrivalEditorMode, string>,
  loading: 'Загружаем данные прихода…',
  notFound: 'Приход не найден.',
  return: 'Вернуться назад',
  submit: {
    create: 'Создать приход',
    edit: 'Сохранить изменения',
  } satisfies Record<ArrivalEditorMode, string>,
  validation: {
    titleRequired: 'Укажите название прихода.',
    occurredAtRequired: 'Укажите дату и время прихода.',
    amountInvalid: 'Сумма должна быть числом.',
  },
  operation: {
    validationError: 'Проверьте заполнение формы.',
    missingArrival: 'Не удалось определить приход для редактирования.',
    draftFailed: 'Не удалось сохранить приход в черновик.',
    saved: 'Приход сохранён.',
  },
  sections: {
    directoriesBadge: 'Директории',
    directoriesTitle: 'Поставщик, товар и категория',
    codesBadge: 'Коды',
    codesTitle: 'Связанные коды',
    codesDescription:
      'Новые коды будут сохранены с выбранным типом. Значения из буфера копируются в форму и не удаляются из общего списка.',
  },
} as const;
