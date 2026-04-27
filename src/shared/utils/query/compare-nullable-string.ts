import { applySortDirection, type SortDirection } from './sort-direction.ts';

export function compareNullableString(
  left: string | null,
  right: string | null,
  direction: SortDirection
): number {
  const normalizedLeft = left ?? '';
  const normalizedRight = right ?? '';

  if (normalizedLeft < normalizedRight) {
    return applySortDirection(-1, direction);
  }

  if (normalizedLeft > normalizedRight) {
    return applySortDirection(1, direction);
  }

  return 0;
}
