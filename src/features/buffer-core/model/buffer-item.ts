import { createId } from '../../../shared/utils/create-id.ts';
import { normalizeText } from '../../../shared/utils/normalize-text.ts';
import { nowIso } from '../../../shared/utils/time.ts';

export interface BufferItem {
  id: string;
  value: string;
  normalizedValue: string;
  capturedAt: string;
  kind?: string;
  source?: string;
}

export interface CreateBufferItemInput {
  value: string;
  capturedAt?: string;
  id?: string;
  kind?: string;
  source?: string;
}

export function normalizeBufferItemValue(value: string): string | null {
  return normalizeText(value);
}

export function createBufferItem(
  input: CreateBufferItemInput
): BufferItem | null {
  const normalizedValue = normalizeBufferItemValue(input.value);
  if (normalizedValue === null) {
    return null;
  }

  return {
    id: input.id ?? createId(),
    value: input.value.trim(),
    normalizedValue,
    capturedAt: input.capturedAt ?? nowIso(),
    ...(input.kind ? { kind: input.kind } : {}),
    ...(input.source ? { source: input.source } : {}),
  };
}
