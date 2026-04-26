import type { UseFormReturnType } from '@mantine/form';

import type { FieldMetadata } from '../field-metadata/field-metadata.types.ts';

export interface DescriptionFieldFamilyProps<TValues> {
  form: UseFormReturnType<TValues>;
  metadata?: FieldMetadata;
  path: string;
}
