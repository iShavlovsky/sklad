import type { ReactElement } from 'react';
import { Checkbox } from '@mantine/core';

import type { BufferItem } from '@/features/buffer-core/model/buffer-item.ts';
import { MiniRecordCard } from '@/shared/ui/record-card';

import { formatBufferCapturedAt } from '../../lib/buffer-page-formatters.ts';

export function BufferCard({
  checked,
  disabled,
  item,
  onEdit,
  onToggle,
}: Readonly<{
  checked: boolean;
  disabled: boolean;
  item: BufferItem;
  onEdit: () => void;
  onToggle: () => void;
}>): ReactElement {
  return (
    <MiniRecordCard
      leadingSlot={
        <Checkbox
          aria-label={item.value}
          checked={checked}
          disabled={disabled}
          onChange={onToggle}
        />
      }
      metrics={[]}
      onOpen={onEdit}
      openLabel={`Изменить элемент буфера ${item.value}`}
      subtitle={formatBufferCapturedAt(item.capturedAt)}
      title={item.value}
    />
  );
}
