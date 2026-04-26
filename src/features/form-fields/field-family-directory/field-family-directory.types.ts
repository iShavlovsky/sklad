import type { UseFormReturnType } from '@mantine/form';

import type { FormPreferenceKey } from '@/features/form-preferences/model/form-preferences.types.ts';

export type DirectoryFieldKind = 'supplier' | 'product' | 'category';

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
