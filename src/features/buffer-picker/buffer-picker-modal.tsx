import { type ReactElement, useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Button,
  Checkbox,
  Drawer,
  Group,
  Paper,
  ScrollArea,
  Stack,
  Text,
} from '@mantine/core';
import { IconListCheck } from '@tabler/icons-react';
import { useStore } from 'zustand';

import type { BufferApplyControllerInstance } from '@/features/buffer-core/model/buffer-apply.controller.instance.ts';
import { bufferApplyController as defaultBufferApplyController } from '@/features/buffer-core/model/buffer-apply.controller.instance.ts';
import { bufferApplySessionStore as defaultBufferApplySessionStore } from '@/features/buffer-core/model/buffer-apply.session-store.ts';
import type { BufferApplySessionStore } from '@/features/buffer-core/model/buffer-apply.types.ts';
import { bufferStore as defaultBufferStore } from '@/features/buffer-core/model/buffer-store.ts';
import type { BufferStore } from '@/features/buffer-core/model/buffer-store.types.ts';
import { overlayArbitrationStore as defaultOverlayArbitrationStore } from '@/features/navigation/model/overlay-arbitration.store.ts';
import type { OverlayArbitrationStore } from '@/features/navigation/model/overlay-arbitration.types.ts';

import styles from './buffer-picker-modal.module.css';

interface BufferPickerModalProps {
  bufferApplyController?: BufferApplyControllerInstance;
  bufferApplySessionStore?: BufferApplySessionStore;
  bufferStore?: BufferStore;
  overlayArbitrationStore?: OverlayArbitrationStore;
}

function formatCapturedAt(value: string): string {
  const timestamp = Date.parse(value);
  if (Number.isNaN(timestamp)) {
    return value;
  }

  return new Intl.DateTimeFormat('ru-RU', {
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    month: '2-digit',
  }).format(timestamp);
}

export function BufferPickerModal({
  bufferApplyController = defaultBufferApplyController,
  bufferApplySessionStore = defaultBufferApplySessionStore,
  bufferStore = defaultBufferStore,
  overlayArbitrationStore = defaultOverlayArbitrationStore,
}: Readonly<BufferPickerModalProps>): ReactElement {
  const currentOverlay = useStore(
    overlayArbitrationStore,
    (state) => state.currentOverlay
  );
  const isOpen = useStore(bufferApplySessionStore, (state) => state.isOpen);
  const request = useStore(
    bufferApplySessionStore,
    (state) => state.currentRequest
  );
  const items = useStore(bufferStore, (state) => state.items);

  const [selectedItemIds, setSelectedItemIds] = useState<string[]>([]);

  const opened =
    isOpen &&
    currentOverlay?.id === 'buffer-picker' &&
    currentOverlay.kind === 'modal' &&
    request !== null;

  useEffect(() => {
    queueMicrotask(() => {
      if (!opened || request === null) {
        setSelectedItemIds([]);
        return;
      }

      setSelectedItemIds((current) =>
        request.selectionMode === 'single' ? current.slice(0, 1) : current
      );
    });
  }, [opened, request]);

  const displayItems = useMemo(() => [...items].reverse(), [items]);

  function toggleSelection(itemId: string): void {
    if (request === null) {
      return;
    }

    setSelectedItemIds((current) => {
      if (request.selectionMode === 'single') {
        return current[0] === itemId ? [] : [itemId];
      }

      return current.includes(itemId)
        ? current.filter((selectedItemId) => selectedItemId !== itemId)
        : [...current, itemId];
    });
  }

  function handleClose(): void {
    bufferApplyController.cancelPicker();
  }

  function handleApply(): void {
    bufferApplyController.applySelectedItems({
      selectedItemIds,
    });
  }

  return (
    <Drawer
      classNames={{
        body: styles.drawerBody,
        content: styles.drawerContent,
        header: styles.drawerHeader,
      }}
      onClose={handleClose}
      opened={opened}
      overlayProps={{ backgroundOpacity: 0.18, blur: 8 }}
      padding="md"
      position="bottom"
      size="100dvh"
      title="Буфер"
      transitionProps={{ duration: 180, transition: 'slide-up' }}
    >
      <div className={styles.pickerLayout}>
        <div className={styles.listPane}>
          {displayItems.length === 0 ? (
            <Alert
              color="gray"
              icon={<IconListCheck size={16} />}
              radius="md"
              title="Буфер пуст"
              variant="light"
            >
              Добавьте коды в общий буфер, затем вернитесь сюда для выбора.
            </Alert>
          ) : (
            <ScrollArea className={styles.scrollArea} offsetScrollbars>
              <Stack className={styles.list} gap="sm">
                {displayItems.map((item) => {
                  const checked = selectedItemIds.includes(item.id);

                  return (
                    <Paper
                      className={styles.itemCard}
                      key={item.id}
                      p="sm"
                      radius="md"
                      shadow="xs"
                      withBorder
                    >
                      <Checkbox
                        checked={checked}
                        label={item.value}
                        onChange={() => {
                          toggleSelection(item.id);
                        }}
                      />
                      <Group gap="xs" mt="xs" wrap="wrap">
                        <Text c="dimmed" size="xs">
                          {formatCapturedAt(item.capturedAt)}
                        </Text>
                      </Group>
                    </Paper>
                  );
                })}
              </Stack>
            </ScrollArea>
          )}
        </div>

        <Group className={styles.footerRow} justify="space-between">
          <Button onClick={handleClose} variant="default">
            Отмена
          </Button>
          <Button
            disabled={selectedItemIds.length === 0 || request === null}
            onClick={handleApply}
          >
            Применить
          </Button>
        </Group>
      </div>
    </Drawer>
  );
}
