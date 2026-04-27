export function paginate<T>(
  rows: T[],
  offset: number,
  limit: number | null
): T[] {
  const safeOffset = offset < 0 ? 0 : offset;

  if (limit === null) return rows.slice(safeOffset);
  if (limit <= 0) return [];

  return rows.slice(safeOffset, safeOffset + limit);
}
