import type { BufferApplyAppliedResult } from '@/features/buffer/core/buffer-core.public.ts';

function splitDepartureCodes(raw: string): string[] {
  return raw
    .split(/[\n,;]/)
    .map((value) => value.trim())
    .filter(Boolean);
}

export function appendCopiedBufferValuesToDepartureCodes(
  currentCodes: string,
  result: BufferApplyAppliedResult
): string {
  const nextCodes = splitDepartureCodes(currentCodes);

  for (const copiedValue of result.copiedValues) {
    if (!nextCodes.includes(copiedValue.value)) {
      nextCodes.push(copiedValue.value);
    }
  }

  return nextCodes.join('\n');
}
