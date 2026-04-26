import { applySortDirection, type SortDirection } from './sort-direction.ts';

export function compareIsoDate(
  left: string,
  right: string,
  direction: SortDirection
): number {
  if (left < right) return applySortDirection(-1, direction);
  if (left > right) return applySortDirection(1, direction);
  return 0;
}
