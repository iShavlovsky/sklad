export type SortDirection = 'asc' | 'desc';

export function applySortDirection(
  value: number,
  direction: SortDirection
): number {
  return direction === 'asc' ? value : -value;
}
