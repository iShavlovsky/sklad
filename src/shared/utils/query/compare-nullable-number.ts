import { applySortDirection, type SortDirection } from './sort-direction.ts';

export function compareNullableNumber(
  left: number | null,
  right: number | null,
  direction: SortDirection
): number {
  const normalizedLeft = left ?? Number.NEGATIVE_INFINITY;
  const normalizedRight = right ?? Number.NEGATIVE_INFINITY;

  if (normalizedLeft < normalizedRight) {
    return applySortDirection(-1, direction);
  }

  if (normalizedLeft > normalizedRight) {
    return applySortDirection(1, direction);
  }

  return 0;
}
