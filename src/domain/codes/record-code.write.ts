import { createId } from '@/shared/utils/create-id.ts';

import type { RecordCodeOwnerKind } from '../common/record-kinds.ts';

import type { RecordCodeInput } from './record-code.input.ts';
import { normalizeRecordCodeValue } from './record-code.normalize.ts';
import type { RecordCodeRecord } from './record-code.record.ts';

export function createRecordCodeRecords(
  ownerKind: RecordCodeOwnerKind,
  ownerId: string,
  createdAt: string,
  codes: RecordCodeInput[]
): RecordCodeRecord[] {
  const seen = new Set<string>();
  const records: RecordCodeRecord[] = [];

  for (const code of codes) {
    const normalizedValue = normalizeRecordCodeValue(code.value);
    if (seen.has(normalizedValue)) continue;

    seen.add(normalizedValue);
    records.push({
      id: createId(),
      ownerKind,
      ownerId,
      value: code.value.trim(),
      normalizedValue,
      kind: code.kind,
      createdAt,
    });
  }

  return records;
}
