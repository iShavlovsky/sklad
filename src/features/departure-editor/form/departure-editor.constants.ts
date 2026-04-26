import type {
  DepartureMode,
  RecordCodeKind,
  SubjectKind,
} from '@/domain/common/record-kinds.ts';

export const DEPARTURE_EDITOR_SUBJECT_KIND_OPTIONS: Array<{
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

export const DEPARTURE_EDITOR_MODE_OPTIONS: Array<{
  label: string;
  value: DepartureMode;
}> = [
  { label: 'Расход', value: 'loss' },
  { label: 'Доход', value: 'profit' },
];

export const DEPARTURE_EDITOR_CODE_KIND_OPTIONS: Array<{
  label: string;
  value: RecordCodeKind;
}> = [
  { label: 'QR', value: 'qr' },
  { label: 'Штрихкод', value: 'barcode' },
  { label: 'Поставщик', value: 'vendor' },
  { label: 'Произвольный', value: 'custom' },
];

export const DEPARTURE_EDITOR_COPY = {
  eyebrow: 'Расходы',
  intro:
    'Создайте новый расход, при необходимости свяжите его с приходом и добавьте коды из буфера или сканера.',
  submit: 'Сохранить',
  cancel: 'Отмена',
  created: 'Расход создан.',
  scannerHint:
    'Сканер используется для уже существующей общей сессии и копирует найденные коды в форму расхода.',
  validation: {
    titleRequired: 'Укажите название расхода.',
    occurredAtRequired: 'Укажите дату и время расхода.',
    amountInvalid: 'Сумма должна быть числом.',
  },
  operation: {
    validationError: 'Проверьте заполнение формы.',
    draftFailed: 'Не удалось сохранить расход в черновик.',
    bufferUnavailable:
      'Не удалось открыть буфер. Проверьте, что верхняя панель доступна и попробуйте ещё раз.',
    scannerUnavailable:
      'Не удалось открыть сканер. Проверьте, что верхняя панель доступна и попробуйте ещё раз.',
  },
  sections: {
    linkBadge: 'Связь с приходом',
    linkTitle: 'Связь с записью прихода',
    linkDescription:
      'Связь с приходом и автозаполнение полей используются только на основе выбранной записи. Данные всегда редактируемы.',
    codesBadge: 'Коды',
    codesTitle: 'Связанные коды',
    codesDescription:
      'Новые коды будут сохранены с выбранным типом. Значения из буфера копируются в форму и не удаляются из общего списка.',
  },
} as const;
