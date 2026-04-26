import type { BufferApplyAppliedResult } from '@/features/buffer-core/model/buffer-apply.result.ts';

import { splitArrivalCodes } from './arrival-editor.mappers.ts';

export function appendCopiedBufferValuesToArrivalCodes(
  currentCodes: string,
  result: BufferApplyAppliedResult
): string {
  const nextCodes = splitArrivalCodes(currentCodes);

  for (const copiedValue of result.copiedValues) {
    if (!nextCodes.includes(copiedValue.value)) {
      nextCodes.push(copiedValue.value);
    }
  }

  return nextCodes.join('\n');
}
