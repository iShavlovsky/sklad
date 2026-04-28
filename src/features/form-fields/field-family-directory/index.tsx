import { type ReactElement, useEffect, useState } from 'react';
import { useDebouncedValue } from '@mantine/hooks';

import { DirectoryFieldControl } from '@/features/form-controls/directory/directory-field.control.tsx';
import { formPreferencesStore } from '@/features/form-preferences/model/form-preferences.store.ts';

import { getValueAtPath } from './field-family-directory.helpers.ts';
import type { DirectoryFieldFamilyProps } from './field-family-directory.types.ts';
import { useDirectoryOptions } from './use-directory-options.ts';

export function DirectoryFieldFamily<TValues>({
  form,
  kind,
  paths,
  preferenceKey,
}: Readonly<DirectoryFieldFamilyProps<TValues>>): ReactElement {
  const values = form.getValues() as Record<string, unknown>;
  const selectedName = String(getValueAtPath(values, paths.namePath) ?? '');
  const selectedId = String(getValueAtPath(values, paths.idPath) ?? '');
  const createIfMissing = Boolean(
    getValueAtPath(values, paths.createIfMissingPath) ?? false
  );
  const [searchValue, setSearchValue] = useState(selectedName);
  const [debouncedSearch] = useDebouncedValue(searchValue, 150);
  const options = useDirectoryOptions(kind, debouncedSearch);
  const supportsCreateIfMissing =
    typeof paths.createIfMissingPath === 'string' &&
    typeof paths.idPath === 'string';

  useEffect(() => {
    if (!createIfMissing) {
      queueMicrotask(() => {
        setSearchValue(selectedName);
      });
    }
  }, [createIfMissing, selectedName]);

  return (
    <DirectoryFieldControl
      createIfMissing={createIfMissing}
      kind={kind}
      manualInputKey={form.key(paths.namePath)}
      onCreateIfMissingChange={(checked) => {
        if (!paths.createIfMissingPath) {
          return;
        }

        form.setFieldValue(paths.createIfMissingPath, checked as never);

        if (paths.idPath && checked) {
          form.setFieldValue(paths.idPath, '' as never);
        }

        if (preferenceKey) {
          formPreferencesStore.getState().rememberValue(preferenceKey, checked);
        }
      }}
      onManualNameChange={(nextValue) => {
        form.setFieldValue(paths.namePath, nextValue as never);
        setSearchValue(nextValue);
      }}
      onSearchChange={setSearchValue}
      onSelectChange={(value) => {
        const next = options.find((option) => option.value === value);

        if (paths.idPath) {
          form.setFieldValue(paths.idPath, (value ?? '') as never);
        }

        form.setFieldValue(paths.namePath, (next?.label ?? '') as never);
        setSearchValue(next?.label ?? '');
      }}
      manualNameValue={searchValue}
      options={options}
      searchValue={searchValue}
      selectedId={selectedId}
      supportsCreateIfMissing={supportsCreateIfMissing}
    />
  );
}
