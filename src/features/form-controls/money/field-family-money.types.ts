import type { UseFormReturnType } from '@mantine/form';

import type { FieldMetadata } from '@/features/form-controls/support/field-metadata/field-metadata.types.ts';

export interface MoneyFieldFamilyProps<TValues> {
  amountMetadata?: FieldMetadata;
  amountPath: string;
  currencyMetadata?: FieldMetadata;
  currencyPath: string;
  form: UseFormReturnType<TValues>;
}
