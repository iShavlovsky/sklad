import type { UseFormReturnType } from '@mantine/form';

import type { SubjectKind } from '@/domain/common/record-kinds.ts';
import type { FormPreferenceKey } from '@/features/form-preferences/model/form-preferences.types.ts';

import type { FieldMetadata } from '@/features/form-controls/support/field-metadata/field-metadata.types.ts';

export interface SubjectKindFieldFamilyProps<TValues> {
  form: UseFormReturnType<TValues>;
  metadata?: FieldMetadata;
  path: string;
  preferenceKey?: FormPreferenceKey;
}

export type SubjectKindOptionValue = SubjectKind | 'other';
