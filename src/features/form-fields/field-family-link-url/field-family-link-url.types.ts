import type { UseFormReturnType } from '@mantine/form';

import type { FieldMetadata } from '../field-metadata/field-metadata.types.ts';

export interface LinkUrlFieldFamilyProps<TValues> {
  form: UseFormReturnType<TValues>;
  metadata?: FieldMetadata;
  path: string;
}
