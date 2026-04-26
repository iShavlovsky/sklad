export function normalizeText(value: string | null): string | null {
  if (value === null) return null;

  const trimmed = value.trim();
  if (!trimmed) return null;

  return trimmed.toLowerCase();
}
