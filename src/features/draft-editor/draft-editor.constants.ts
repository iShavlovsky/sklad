import type {
  DepartureMode,
  RecordCodeKind,
  RecordKind,
  SubjectKind,
} from '@/domain/common/record-kinds.ts';

import type { DraftEditorSectionName } from './draft-editor.types.ts';

export const DRAFT_EDITOR_SECTION_ELEMENT_IDS: Record<
  DraftEditorSectionName,
  string
> = {
  kind: 'draft-editor-section-kind',
  basic: 'draft-editor-section-basic',
  directories: 'draft-editor-section-directories',
  codes: 'draft-editor-section-codes',
  additional: 'draft-editor-section-additional',
  link: 'draft-editor-section-link',
};

export const DRAFT_EDITOR_KIND_OPTIONS: ReadonlyArray<{
  label: string;
  value: RecordKind;
}> = [
  { label: 'Приход', value: 'arrival' },
  { label: 'Расход', value: 'departure' },
];

export const DRAFT_EDITOR_SUBJECT_KIND_OPTIONS: ReadonlyArray<{
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

export const DRAFT_EDITOR_CODE_KIND_OPTIONS: ReadonlyArray<{
  label: string;
  value: RecordCodeKind;
}> = [
  { label: 'QR', value: 'qr' },
  { label: 'Штрихкод', value: 'barcode' },
  { label: 'Поставщик', value: 'vendor' },
  { label: 'Произвольный', value: 'custom' },
];

export const DRAFT_EDITOR_DEPARTURE_MODE_OPTIONS: ReadonlyArray<{
  label: string;
  value: DepartureMode;
}> = [
  { label: 'Расход', value: 'loss' },
  { label: 'Доход', value: 'profit' },
];
