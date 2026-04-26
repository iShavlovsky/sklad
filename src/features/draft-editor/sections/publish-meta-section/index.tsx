import type { ReactElement } from 'react';
import { Button, Group, Text } from '@mantine/core';

import { FormSectionCard } from '@/shared/ui/form-shell';

interface DraftPublishMetaSectionProps {
  isPublishing: boolean;
  onPublish: () => void;
}

export function DraftPublishMetaSection({
  isPublishing,
  onPublish,
}: Readonly<DraftPublishMetaSectionProps>): ReactElement {
  return (
    <FormSectionCard>
      <Group justify="space-between" wrap="wrap">
        <Text c="dimmed" size="sm">
          Публикация остаётся отдельным действием и не заменяет сохранение.
        </Text>
        <Button
          loading={isPublishing}
          onClick={onPublish}
          type="button"
          variant="light"
        >
          Опубликовать
        </Button>
      </Group>
    </FormSectionCard>
  );
}
