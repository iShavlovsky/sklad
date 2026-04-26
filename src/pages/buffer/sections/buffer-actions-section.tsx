import type { ReactElement } from 'react';
import { Button, Group, Stack, Text } from '@mantine/core';
import { IconTrash } from '@tabler/icons-react';

interface BufferActionsSectionProps {
  canManage: boolean;
  itemCount: number;
  selectedCount: number;
  onClear: () => void;
  onDeleteSelected: () => void;
}

export function BufferActionsSection({
  canManage,
  itemCount,
  onClear,
  onDeleteSelected,
  selectedCount,
}: Readonly<BufferActionsSectionProps>): ReactElement {
  return (
    <Stack className="page-section" gap="xs">
      <Text c="dimmed" size="xs">
        {selectedCount > 0
          ? `Выбрано: ${selectedCount}`
          : `Всего: ${itemCount}`}
      </Text>
      <Group gap="xs" justify="center" wrap="wrap">
        <Button
          color="red"
          disabled={!canManage || selectedCount === 0}
          leftSection={<IconTrash size={16} />}
          onClick={onDeleteSelected}
          size="xs"
          variant="light"
        >
          Удалить выбранное
        </Button>
        <Button
          color="red"
          disabled={!canManage || itemCount === 0}
          leftSection={<IconTrash size={16} />}
          onClick={onClear}
          size="xs"
          variant="light"
        >
          Очистить буфер
        </Button>
      </Group>
    </Stack>
  );
}
