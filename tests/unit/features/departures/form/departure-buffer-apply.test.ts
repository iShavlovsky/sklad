import { describe, expect, it } from 'vitest';

import { appendCopiedBufferValuesToDepartureCodes } from '../../../../../src/features/departures/editor/form/model/departure-editor.buffer-apply.ts';

describe('appendCopiedBufferValuesToDepartureCodes', () => {
  it('appends copied buffer values to the departure form codes', () => {
    const result = appendCopiedBufferValuesToDepartureCodes('DEP-001', {
      code: 'applied',
      requestId: 'request-1',
      transferMode: 'copy',
      selectedItemIds: ['buffer-1', 'buffer-2'],
      copiedValues: [
        {
          bufferItemId: 'buffer-1',
          value: 'DEP-002',
          capturedAt: '2026-04-21T08:00:00.000Z',
        },
        {
          bufferItemId: 'buffer-2',
          value: 'DEP-003',
          capturedAt: '2026-04-21T08:01:00.000Z',
        },
      ],
    });

    expect(result).toBe('DEP-001\nDEP-002\nDEP-003');
  });

  it('keeps existing departure codes unique when copied values repeat them', () => {
    const result = appendCopiedBufferValuesToDepartureCodes(
      'DEP-001\nDEP-002',
      {
        code: 'applied',
        requestId: 'request-2',
        transferMode: 'copy',
        selectedItemIds: ['buffer-1', 'buffer-2'],
        copiedValues: [
          {
            bufferItemId: 'buffer-1',
            value: 'DEP-002',
            capturedAt: '2026-04-21T08:00:00.000Z',
          },
          {
            bufferItemId: 'buffer-2',
            value: 'DEP-003',
            capturedAt: '2026-04-21T08:01:00.000Z',
          },
        ],
      }
    );

    expect(result).toBe('DEP-001\nDEP-002\nDEP-003');
  });
});
