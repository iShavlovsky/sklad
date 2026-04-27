import { describe, expect, it } from 'vitest';

import { formatIsoForDateTimePicker } from '../../../../src/features/form-controls/date-time/field-family-occurred-at.format.ts';

describe('formatIsoForDateTimePicker', () => {
  it('formats valid ISO values for the Mantine date-time picker', () => {
    expect(formatIsoForDateTimePicker('2026-04-21T08:05:30')).toBe(
      '2026-04-21 08:05:00'
    );
  });

  it('returns invalid values unchanged', () => {
    expect(formatIsoForDateTimePicker('not-a-date')).toBe('not-a-date');
  });
});
