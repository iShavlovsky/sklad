import type { UseFormReturnType } from '@mantine/form';

import type { FieldMetadata } from '../field-metadata/field-metadata.types.ts';

export interface OccurredAtFieldFamilyProps<TValues> {
  form: UseFormReturnType<TValues>;
  metadata?: FieldMetadata;
  onChange: (value: string) => void;
  path: string;
  testId?: string;
  value: string;
}
