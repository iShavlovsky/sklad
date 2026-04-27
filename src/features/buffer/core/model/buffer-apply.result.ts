import type { BufferItem } from './buffer-item.ts';

export type BufferApplyTransferMode = 'copy';

export interface BufferApplyCopiedValue {
  bufferItemId: string;
  value: string;
  capturedAt: string;
  kind?: string;
  source?: string;
}

export interface BufferApplyAppliedResult {
  code: 'applied';
  requestId: string;
  transferMode: BufferApplyTransferMode;
  selectedItemIds: string[];
  copiedValues: BufferApplyCopiedValue[];
}

export interface BufferApplyCancelledResult {
  code: 'cancelled';
  requestId: string;
  transferMode: BufferApplyTransferMode;
}

export type BufferApplyResult =
  | BufferApplyAppliedResult
  | BufferApplyCancelledResult;

export function createBufferApplyCopiedValue(
  item: BufferItem
): BufferApplyCopiedValue {
  return {
    bufferItemId: item.id,
    value: item.value,
    capturedAt: item.capturedAt,
    ...(item.kind ? { kind: item.kind } : {}),
    ...(item.source ? { source: item.source } : {}),
  };
}

export function createBufferApplyAppliedResult(input: {
  requestId: string;
  selectedItems: BufferItem[];
}): BufferApplyAppliedResult {
  return {
    code: 'applied',
    requestId: input.requestId,
    transferMode: 'copy',
    selectedItemIds: input.selectedItems.map((item) => item.id),
    copiedValues: input.selectedItems.map(createBufferApplyCopiedValue),
  };
}

export function createBufferApplyCancelledResult(
  requestId: string
): BufferApplyCancelledResult {
  return {
    code: 'cancelled',
    requestId,
    transferMode: 'copy',
  };
}
