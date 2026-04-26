import { type ReactElement, useEffect, useState } from 'react';
import {
  Box,
  Checkbox,
  Group,
  Select,
  Stack,
  Text,
  TextInput,
} from '@mantine/core';
import { useDebouncedValue } from '@mantine/hooks';

import { formPreferencesStore } from '@/features/form-preferences/model/form-preferences.store.ts';

import { FieldInfoTrigger, FieldLabel } from '../field-info-trigger';
import type { FormInfoContentKey } from '../field-metadata/field-info-content.ts';

import { DIRECTORY_FIELD_METADATA } from './field-family-directory.constants.ts';
import { getValueAtPath } from './field-family-directory.helpers.ts';
import type { DirectoryFieldFamilyProps } from './field-family-directory.types.ts';
import { useDirectoryOptions } from './use-directory-options.ts';

const CREATE_TOGGLE_HELP_KEYS: Record<
  keyof typeof DIRECTORY_FIELD_METADATA,
  FormInfoContentKey
> = {
  category: 'field.directory.category.createToggle',
  product: 'field.directory.product.createToggle',
  supplier: 'field.directory.supplier.createToggle',
};

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
  const metadata = supportsCreateIfMissing
    ? DIRECTORY_FIELD_METADATA[kind].withCreateIfMissing
    : DIRECTORY_FIELD_METADATA[kind].selectOnly;
  const createToggleHelpKey = CREATE_TOGGLE_HELP_KEYS[kind];

  useEffect(() => {
    if (!createIfMissing) {
      queueMicrotask(() => {
        setSearchValue(selectedName);
      });
    }
  }, [createIfMissing, selectedName]);

  return (
    <Stack gap="xs">
      {!supportsCreateIfMissing || !createIfMissing ? (
        <Select
          clearable={supportsCreateIfMissing}
          data={options}
          label={<FieldLabel metadata={metadata} />}
          nothingFoundMessage="Совпадений нет"
          onChange={(value) => {
            const next = options.find((option) => option.value === value);

            if (paths.idPath) {
              form.setFieldValue(paths.idPath, (value ?? '') as never);
            }

            form.setFieldValue(paths.namePath, (next?.label ?? '') as never);
            setSearchValue(next?.label ?? '');
          }}
          onSearchChange={setSearchValue}
          placeholder={metadata.placeholder}
          searchable
          searchValue={searchValue}
          value={selectedId === '' ? null : selectedId}
        />
      ) : (
        <TextInput
          key={form.key(paths.namePath)}
          label={<FieldLabel metadata={metadata} />}
          onChange={(event) => {
            const nextValue = event.currentTarget.value;
            form.setFieldValue(paths.namePath, nextValue as never);
            setSearchValue(nextValue);
          }}
          placeholder={`Новый ${metadata.label.toLowerCase()}`}
          value={selectedName}
        />
      )}

      {supportsCreateIfMissing && paths.createIfMissingPath ? (
        <Checkbox
          checked={createIfMissing}
          label={
            <Group gap={6} wrap="nowrap">
              <Box component="span" style={{ minWidth: 0 }}>
                <Text span size="sm">
                  {`Создать новый ${metadata.label.toLowerCase()}, если совпадение не найдено`}
                </Text>
              </Box>
              <FieldInfoTrigger contentKey={createToggleHelpKey} size="xs" />
            </Group>
          }
          onChange={(event) => {
            const { checked } = event.currentTarget;
            if (!paths.createIfMissingPath) {
              return;
            }

            form.setFieldValue(paths.createIfMissingPath, checked as never);

            if (paths.idPath && checked) {
              form.setFieldValue(paths.idPath, '' as never);
            }

            if (preferenceKey) {
              formPreferencesStore
                .getState()
                .rememberValue(preferenceKey, checked);
            }
          }}
        />
      ) : null}
    </Stack>
  );
}
