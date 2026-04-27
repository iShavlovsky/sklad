import type { UseFormReturnType } from '@mantine/form';

import type { FieldMetadata } from '@/features/form-controls/support/field-metadata/field-metadata.types.ts';

export interface NoteFieldFamilyProps<TValues> {
  form: UseFormReturnType<TValues>;
  metadata?: FieldMetadata;
  path: string;
}
