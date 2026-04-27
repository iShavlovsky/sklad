import type { RecordCodeKind } from '@/domain/common/record-kinds.ts';
import type { FieldMetadata } from '@/features/form-controls/support/field-metadata/field-metadata.types.ts';

export const CODES_FIELD_METADATA: FieldMetadata = {
  helpKey: 'field.codes.list',
  label: 'Коды',
};

export const CODE_KIND_FIELD_METADATA: FieldMetadata = {
  helpKey: 'field.codes.kind',
  label: 'Тип кода',
};

export const CODE_KIND_OPTIONS: Array<{
  label: string;
  value: RecordCodeKind;
}> = [
  { label: 'QR', value: 'qr' },
  { label: 'Штрихкод', value: 'barcode' },
  { label: 'Поставщик', value: 'vendor' },
  { label: 'Произвольный', value: 'custom' },
];
