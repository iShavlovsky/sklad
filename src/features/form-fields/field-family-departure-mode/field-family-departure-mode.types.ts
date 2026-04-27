import type { UseFormReturnType } from '@mantine/form';

import type { FieldMetadata } from '@/features/form-controls/support/field-metadata/field-metadata.types.ts';
import type { FormPreferenceKey } from '@/features/form-preferences/model/form-preferences.types.ts';

export interface DepartureModeFieldFamilyProps<TValues> {
  form: UseFormReturnType<TValues>;
  metadata?: FieldMetadata;
  path: string;
  preferenceKey?: FormPreferenceKey;
}
