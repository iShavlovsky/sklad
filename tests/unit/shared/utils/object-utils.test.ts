import { describe, expect, it } from 'vitest';

import { omit } from '../../../../src/shared/utils/object-utils.ts';

describe('omit', () => {
  it('returns a shallow copy without the requested key', () => {
    const source = {
      id: 'record-1',
      label: 'Буфер',
      internal: true,
    };

    expect(omit(source, 'internal')).toEqual({
      id: 'record-1',
      label: 'Буфер',
    });
  });
});
