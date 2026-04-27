import type { UseFormReturnType } from '@mantine/form';

import type { DirectoryFieldKind } from '@/features/form-controls/directory/directory-field.types.ts';
import type { FormPreferenceKey } from '@/features/form-preferences/model/form-preferences.types.ts';

export type { DirectoryFieldKind } from '@/features/form-controls/directory/directory-field.types.ts';

export interface DirectoryFieldPathMap {
  createIfMissingPath?: string;
  idPath?: string;
  namePath: string;
}

export interface DirectoryFieldFamilyProps<TValues> {
  form: UseFormReturnType<TValues>;
  kind: DirectoryFieldKind;
  paths: DirectoryFieldPathMap;
  preferenceKey?: FormPreferenceKey;
}
