type DateRangeLike = {
  from: string | null;
  to: string | null;
};

export function matchesDateRange(
  value: string,
  range: DateRangeLike
): boolean {
  if (range.from !== null && value < range.from) return false;
  if (range.to !== null && value > range.to) return false;

  return true;
}
