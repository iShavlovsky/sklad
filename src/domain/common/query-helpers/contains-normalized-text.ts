import { isDefined } from '@/shared/utils/type-guards.ts';

export function containsNormalizedText(
  values: Array<string | null | undefined>,
  normalizedSearch: string
): boolean {
  if (!normalizedSearch) return true;
  const haystack = values.filter(isDefined).join(' ').toLowerCase();
  return haystack.includes(normalizedSearch);
}
