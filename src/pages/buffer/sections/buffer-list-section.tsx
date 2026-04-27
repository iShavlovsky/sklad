import type { ReactElement } from 'react';
import { Box, Stack, Text } from '@mantine/core';

import { CollectionSection } from '@/shared/ui/collection-section';

import { BufferCard } from '../components/buffer-card/buffer-card';
import type { BufferPageState } from '../lib/use-buffer-page-state.ts';

interface BufferListSectionProps {
  state: BufferPageState;
}

export function BufferListSection({
  state,
}: Readonly<BufferListSectionProps>): ReactElement {
  return (
    <Box
      className="page-section"
      style={{ display: 'flex', flex: '1 1 auto', minHeight: 0 }}
    >
      <CollectionSection
        emptyState={
          <Stack align="center" gap="xs">
            <Text fw={600}>Буфер пуст</Text>
            <Text c="dimmed" size="sm" ta="center">
              Добавьте коды через сканер или файл, чтобы они появились в списке.
            </Text>
          </Stack>
        }
        filterMenu={state.filterMenu}
        getItemId={(item) => item.id}
        items={state.visibleItems}
        listLabel="Список буфера"
        onSearchChange={state.setSearchValue}
        onSortChange={state.setSortValue}
        renderItem={(item, context) => (
          <BufferCard
            checked={context.selected}
            disabled={!state.canManage || !context.selectable}
            item={item}
            onEdit={() => state.openEditor(item.id)}
            onToggle={() => context.toggleSelection()}
          />
        )}
        searchPlaceholder="Поиск по номеру, типу, источнику и дате"
        searchValue={state.searchValue}
        selection={{
          enabled: true,
          isItemSelectable: () => state.canManage,
          onChange: (nextSelectedIds) => state.setSelectedIds(nextSelectedIds),
        }}
        sortOptions={state.BUFFER_PAGE_SORT_OPTIONS}
        sortValue={state.sortValue}
      />
    </Box>
  );
}
