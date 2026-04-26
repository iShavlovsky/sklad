import type { ReactElement } from 'react';
import { Badge, Group, SegmentedControl, Text } from '@mantine/core';

import type { RecordKind } from '@/domain/common/record-kinds.ts';
import { FormSectionCard } from '@/shared/ui/form-shell';

import { DRAFT_EDITOR_KIND_OPTIONS } from '../draft-editor.constants.ts';

interface DraftEditorKindSectionProps {
  kind: RecordKind;
  isReadonly: boolean;
  onKindChange: (value: RecordKind) => void;
}

export function DraftEditorKindSection({
  kind,
  isReadonly,
  onKindChange,
}: Readonly<DraftEditorKindSectionProps>): ReactElement {
  if (isReadonly) {
    return (
      <FormSectionCard>
        <Group gap="xs">
          <Badge color="blue" variant="light">
            {kind === 'arrival' ? 'Приход' : 'Расход'}
          </Badge>
          <Text c="dimmed" size="sm">
            Тип нельзя изменить после создания.
          </Text>
        </Group>
      </FormSectionCard>
    );
  }

  return (
    <FormSectionCard>
      <SegmentedControl
        data={[...DRAFT_EDITOR_KIND_OPTIONS]}
        fullWidth
        onChange={(value) => {
          onKindChange(value as RecordKind);
        }}
        value={kind}
      />
    </FormSectionCard>
  );
}
