import { describe, expect, it } from 'vitest';

import type { DateRange } from '../../../../src/domain/common/value-objects.ts';
import {
  applySortDirection,
  compareIsoDate,
  compareNullableNumber,
  compareNullableString,
  containsNormalizedText,
  matchesDateRange,
  normalizeSearch,
  paginate,
} from '../../../../src/shared/utils/query/index.ts';

describe('query helpers', () => {
  describe('applySortDirection', () => {
    it('keeps ascending comparison values and flips descending values', () => {
      expect(applySortDirection(-1, 'asc')).toBe(-1);
      expect(applySortDirection(1, 'asc')).toBe(1);
      expect(applySortDirection(-1, 'desc')).toBe(1);
      expect(applySortDirection(1, 'desc')).toBe(-1);
    });
  });

  describe('nullable comparators', () => {
    it('compares nullable strings with null treated as an empty string', () => {
      expect(compareNullableString(null, 'alpha', 'asc')).toBeLessThan(0);
      expect(compareNullableString('beta', 'alpha', 'asc')).toBeGreaterThan(0);
      expect(compareNullableString('alpha', 'beta', 'desc')).toBeGreaterThan(0);
      expect(compareNullableString(null, null, 'asc')).toBe(0);
    });

    it('compares nullable numbers with null treated as negative infinity', () => {
      expect(compareNullableNumber(null, 0, 'asc')).toBeLessThan(0);
      expect(compareNullableNumber(2, 1, 'asc')).toBeGreaterThan(0);
      expect(compareNullableNumber(1, 2, 'desc')).toBeGreaterThan(0);
      expect(compareNullableNumber(null, null, 'asc')).toBe(0);
    });
  });

  describe('compareIsoDate', () => {
    it('compares ISO date strings by lexical date order and sort direction', () => {
      expect(compareIsoDate('2026-01-01', '2026-01-02', 'asc')).toBeLessThan(0);
      expect(compareIsoDate('2026-01-02', '2026-01-01', 'asc')).toBeGreaterThan(0);
      expect(compareIsoDate('2026-01-01', '2026-01-02', 'desc')).toBeGreaterThan(0);
      expect(compareIsoDate('2026-01-01', '2026-01-01', 'desc')).toBe(0);
    });
  });

  describe('normalizeSearch', () => {
    it('trims and lowercases search text without rewriting inner spacing', () => {
      expect(normalizeSearch('  Alpha  BETA  ')).toBe('alpha  beta');
    });
  });

  describe('containsNormalizedText', () => {
    it('matches normalized search text against defined values only', () => {
      expect(
        containsNormalizedText(['Alpha', null, undefined, 'Beta'], 'alpha beta')
      ).toBe(true);
      expect(containsNormalizedText(['Alpha', null], 'gamma')).toBe(false);
    });

    it('treats an empty normalized search as a match', () => {
      expect(containsNormalizedText([], '')).toBe(true);
      expect(containsNormalizedText([null, undefined], '')).toBe(true);
    });
  });

  describe('paginate', () => {
    it('returns a normal page window', () => {
      expect(paginate(['a', 'b', 'c', 'd'], 1, 2)).toEqual(['b', 'c']);
    });

    it('clamps negative offsets and handles null or non-positive limits', () => {
      expect(paginate(['a', 'b', 'c'], -2, 2)).toEqual(['a', 'b']);
      expect(paginate(['a', 'b', 'c'], 1, null)).toEqual(['b', 'c']);
      expect(paginate(['a', 'b', 'c'], 1, 0)).toEqual([]);
      expect(paginate(['a', 'b', 'c'], 1, -1)).toEqual([]);
    });
  });

  describe('matchesDateRange', () => {
    it('matches inclusive closed date ranges', () => {
      const range: DateRange = {
        from: '2026-01-10',
        to: '2026-01-20',
      };

      expect(matchesDateRange('2026-01-10', range)).toBe(true);
      expect(matchesDateRange('2026-01-15', range)).toBe(true);
      expect(matchesDateRange('2026-01-20', range)).toBe(true);
      expect(matchesDateRange('2026-01-09', range)).toBe(false);
      expect(matchesDateRange('2026-01-21', range)).toBe(false);
    });

    it('matches open-ended date ranges', () => {
      expect(
        matchesDateRange('2026-01-09', {
          from: null,
          to: '2026-01-10',
        })
      ).toBe(true);
      expect(
        matchesDateRange('2026-01-11', {
          from: null,
          to: '2026-01-10',
        })
      ).toBe(false);
      expect(
        matchesDateRange('2026-01-11', {
          from: '2026-01-10',
          to: null,
        })
      ).toBe(true);
      expect(
        matchesDateRange('2026-01-09', {
          from: '2026-01-10',
          to: null,
        })
      ).toBe(false);
      expect(
        matchesDateRange('2026-01-09', {
          from: null,
          to: null,
        })
      ).toBe(true);
    });
  });
});
