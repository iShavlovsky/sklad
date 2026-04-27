import type { ReactElement } from 'react';
import {
  Box,
  Checkbox,
  Group,
  Select,
  Stack,
  Text,
  TextInput,
} from '@mantine/core';

import {
  FieldInfoTrigger,
  FieldLabel,
} from '@/features/form-controls/support/field-info-trigger';
import type { FormInfoContentKey } from '@/features/form-controls/support/field-metadata/field-info-content.ts';

import type { DirectoryFieldControlProps } from './directory-field.types.ts';
import { DIRECTORY_FIELD_METADATA } from './field-family-directory.constants.ts';

const CREATE_TOGGLE_HELP_KEYS: Record<
  keyof typeof DIRECTORY_FIELD_METADATA,
  FormInfoContentKey
> = {
  category: 'field.directory.category.createToggle',
  product: 'field.directory.product.createToggle',
  supplier: 'field.directory.supplier.createToggle',
};

export function DirectoryFieldControl({
  createIfMissing,
  kind,
  manualInputKey,
  onCreateIfMissingChange,
  onManualNameChange,
  onSearchChange,
  onSelectChange,
  options,
  searchValue,
  selectedId,
  selectedName,
  supportsCreateIfMissing,
}: Readonly<DirectoryFieldControlProps>): ReactElement {
  const metadata = supportsCreateIfMissing
    ? DIRECTORY_FIELD_METADATA[kind].withCreateIfMissing
    : DIRECTORY_FIELD_METADATA[kind].selectOnly;
  const createToggleHelpKey = CREATE_TOGGLE_HELP_KEYS[kind];

  return (
    <Stack gap="xs">
      {!supportsCreateIfMissing || !createIfMissing ? (
        <Select
          clearable={supportsCreateIfMissing}
          data={options}
          label={<FieldLabel metadata={metadata} />}
          nothingFoundMessage="Совпадений нет"
          onChange={onSelectChange}
          onSearchChange={onSearchChange}
          placeholder={metadata.placeholder}
          searchable
          searchValue={searchValue}
          value={selectedId === '' ? null : selectedId}
        />
      ) : (
        <TextInput
          key={manualInputKey}
          label={<FieldLabel metadata={metadata} />}
          onChange={(event) => {
            onManualNameChange(event.currentTarget.value);
          }}
          placeholder={`Новый ${metadata.label.toLowerCase()}`}
          value={selectedName}
        />
      )}

      {supportsCreateIfMissing ? (
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
            onCreateIfMissingChange(event.currentTarget.checked);
          }}
        />
      ) : null}
    </Stack>
  );
}
