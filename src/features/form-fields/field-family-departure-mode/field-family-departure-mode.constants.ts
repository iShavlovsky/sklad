import type { DepartureMode } from '@/domain/common/record-kinds.ts';

import type { FieldMetadata } from '@/features/form-controls/support/field-metadata/field-metadata.types.ts';

export const DEPARTURE_MODE_FIELD_METADATA: FieldMetadata = {
  helpKey: 'field.departureMode',
  label: 'Режим',
};

export const DEPARTURE_MODE_OPTIONS: Array<{
  label: string;
  value: DepartureMode;
}> = [
  { label: 'Расход', value: 'loss' },
  { label: 'Доход', value: 'profit' },
];
