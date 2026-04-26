import type { ReactElement } from 'react';
import { Badge, Group, SegmentedControl, Stack, Text } from '@mantine/core';

import type { RecordKind } from '@/domain/common/record-kinds.ts';
import { FieldLabel } from '@/features/form-fields/field-info-trigger';
import type { FieldMetadata } from '@/features/form-fields/field-metadata/field-metadata.types.ts';
import { formPreferencesStore } from '@/features/form-preferences/model/form-preferences.store.ts';

import { DRAFT_FORM_PREFERENCE_KEYS } from '../../model/draft-form.constants.ts';

interface DraftKindFieldProps {
  isReadonly: boolean;
  kind: RecordKind;
  onKindChange: (value: RecordKind) => void;
}

const DRAFT_KIND_FIELD_METADATA: FieldMetadata = {
  helpKey: 'field.draftKind',
  label: 'Тип черновика',
};

export function DraftKindField({
  isReadonly,
  kind,
  onKindChange,
}: Readonly<DraftKindFieldProps>): ReactElement {
  if (isReadonly) {
    return (
      <Stack gap={4}>
        <Text fw={500} size="sm">
          <FieldLabel metadata={DRAFT_KIND_FIELD_METADATA} />
        </Text>
        <Group gap="xs">
          <Badge color="blue" variant="light">
            {kind === 'arrival' ? 'Приход' : 'Расход'}
          </Badge>
          <Text c="dimmed" size="sm">
            Тип нельзя изменить после создания.
          </Text>
        </Group>
      </Stack>
    );
  }

  return (
    <Stack gap={4}>
      <Text fw={500} size="sm">
        <FieldLabel metadata={DRAFT_KIND_FIELD_METADATA} />
      </Text>
      <SegmentedControl
        data={[
          { label: 'Приход', value: 'arrival' },
          { label: 'Расход', value: 'departure' },
        ]}
        fullWidth
        onChange={(value) => {
          formPreferencesStore
            .getState()
            .rememberValue(DRAFT_FORM_PREFERENCE_KEYS.kind, value);
          onKindChange(value as RecordKind);
        }}
        value={kind}
      />
    </Stack>
  );
}
