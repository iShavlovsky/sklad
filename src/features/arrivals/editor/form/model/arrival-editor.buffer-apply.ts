import type { BufferApplyAppliedResult } from '@/features/buffer/core/buffer-core.public.ts';

import { splitArrivalCodes } from './arrival-editor.form-mappers.ts';

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
