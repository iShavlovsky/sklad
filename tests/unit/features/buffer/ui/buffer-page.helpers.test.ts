import { describe, expect, it } from 'vitest';

import type { BufferItem } from '../../../../../src/features/buffer/core/model/buffer-item.ts';
import { filterAndSortBufferItems } from '../../../../../src/pages/buffer/lib/buffer-page-mappers.ts';

const ITEMS: BufferItem[] = [
  {
    id: 'buffer-1',
    value: 'BETA-002',
    normalizedValue: 'beta-002',
    capturedAt: '2026-04-21T08:01:00.000Z',
    kind: 'qr',
    source: 'scanner-live',
  },
  {
    id: 'buffer-2',
    value: 'ALPHA-001',
    normalizedValue: 'alpha-001',
    capturedAt: '2026-04-21T08:00:00.000Z',
    kind: 'barcode',
    source: 'manual',
  },
];

describe('filterAndSortBufferItems', () => {
  it('keeps search as view-only filtering by value, kind, or source', () => {
    expect(
      filterAndSortBufferItems(ITEMS, {
        kind: null,
        reversed: true,
        search: 'manual',
        source: null,
        sortBy: 'capturedAt',
      }).map((item) => item.id)
    ).toEqual(['buffer-2']);
  });

  it('sorts by newest capture first without mutating canonical order', () => {
    const result = filterAndSortBufferItems(ITEMS, {
      kind: null,
      reversed: true,
      search: '',
      source: null,
      sortBy: 'capturedAt',
    });

    expect(result.map((item) => item.id)).toEqual(['buffer-1', 'buffer-2']);
    expect(ITEMS.map((item) => item.id)).toEqual(['buffer-1', 'buffer-2']);
  });

  it('sorts by value for the page view only', () => {
    const result = filterAndSortBufferItems(ITEMS, {
      kind: null,
      reversed: false,
      search: '',
      source: null,
      sortBy: 'value',
    });

    expect(result.map((item) => item.value)).toEqual(['ALPHA-001', 'BETA-002']);
  });

  it('filters by source and kind before sorting', () => {
    const result = filterAndSortBufferItems(ITEMS, {
      kind: 'qr',
      reversed: true,
      search: '',
      source: 'scanner-live',
      sortBy: 'capturedAt',
    });

    expect(result.map((item) => item.id)).toEqual(['buffer-1']);
  });
});
