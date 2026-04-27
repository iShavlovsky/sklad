import { describe, expect, it } from 'vitest';

import { appendCopiedBufferValuesToArrivalCodes } from '../../../../../src/features/arrivals/editor/form/model/arrival-editor.buffer-apply.ts';

describe('appendCopiedBufferValuesToArrivalCodes', () => {
  it('appends copied buffer values to the arrival form codes', () => {
    const result = appendCopiedBufferValuesToArrivalCodes('ARR-001', {
      code: 'applied',
      requestId: 'request-1',
      transferMode: 'copy',
      selectedItemIds: ['buffer-1', 'buffer-2'],
      copiedValues: [
        {
          bufferItemId: 'buffer-1',
          value: 'ARR-002',
          capturedAt: '2026-04-21T08:00:00.000Z',
        },
        {
          bufferItemId: 'buffer-2',
          value: 'ARR-003',
          capturedAt: '2026-04-21T08:01:00.000Z',
        },
      ],
    });

    expect(result).toBe('ARR-001\nARR-002\nARR-003');
  });

  it('keeps existing arrival codes unique when copied values repeat them', () => {
    const result = appendCopiedBufferValuesToArrivalCodes('ARR-001\nARR-002', {
      code: 'applied',
      requestId: 'request-2',
      transferMode: 'copy',
      selectedItemIds: ['buffer-1', 'buffer-2'],
      copiedValues: [
        {
          bufferItemId: 'buffer-1',
          value: 'ARR-002',
          capturedAt: '2026-04-21T08:00:00.000Z',
        },
        {
          bufferItemId: 'buffer-2',
          value: 'ARR-003',
          capturedAt: '2026-04-21T08:01:00.000Z',
        },
      ],
    });

    expect(result).toBe('ARR-001\nARR-002\nARR-003');
  });
});
