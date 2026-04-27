import type { BufferItem } from '@/features/buffer/core/buffer-core.public.ts';

const DUPLICATE_CAPTURED_AT_FORMATTER = new Intl.DateTimeFormat('ru-RU', {
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  month: '2-digit',
  year: 'numeric',
});

function formatDuplicateSourceLabel(source: BufferItem['source']): string {
  switch (source) {
    case 'scanner-live':
      return 'Сканер';
    case 'scanner-photo':
      return 'Файл';
    case 'manual-import':
      return 'Вручную';
    default:
      return source?.trim() ? source : '—';
  }
}

function formatDuplicateKindLabel(kind: BufferItem['kind']): string {
  return kind?.trim() ? kind : '—';
}

function formatDuplicateCapturedAtLabel(
  capturedAt: BufferItem['capturedAt']
): string {
  const timestamp = Date.parse(capturedAt);

  if (Number.isNaN(timestamp)) {
    return capturedAt;
  }

  return DUPLICATE_CAPTURED_AT_FORMATTER.format(timestamp);
}

export function createDuplicateStatusMessage(
  value: string,
  existingItem: BufferItem
): string {
  return `Код ${value.trim()} уже есть в буфере. Дата: ${formatDuplicateCapturedAtLabel(existingItem.capturedAt)}. Тип: ${formatDuplicateKindLabel(existingItem.kind)}. Откуда: ${formatDuplicateSourceLabel(existingItem.source)}.`;
}
