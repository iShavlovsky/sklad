import type { DateRange } from '@/domain/common/value-objects.ts';

export function matchesDateRange(value: string, range: DateRange): boolean {
  if (range.from !== null && value < range.from) return false;
  if (range.to !== null && value > range.to) return false;

  return true;
}
