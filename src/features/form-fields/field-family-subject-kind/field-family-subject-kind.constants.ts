import type { SubjectKind } from '@/domain/common/record-kinds.ts';
import type { FieldMetadata } from '@/features/form-controls/support/field-metadata/field-metadata.types.ts';

export const SUBJECT_KIND_FIELD_METADATA: FieldMetadata = {
  helpKey: 'field.subjectKind',
  label: 'Тип субъекта',
};

export const SUBJECT_KIND_OPTIONS: Array<{
  label: string;
  value: SubjectKind;
}> = [
  { label: 'Товар', value: 'product' },
  { label: 'Деньги', value: 'money' },
  { label: 'Зарплата', value: 'salary' },
  { label: 'Кешбэк', value: 'cashback' },
  { label: 'Платёж', value: 'payment' },
  { label: 'Другое', value: 'other' },
];
