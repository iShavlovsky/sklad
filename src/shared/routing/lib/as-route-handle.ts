import type { AppRouteHandle } from '@/shared/routing/types/route-meta';

export function asRouteHandle(value: unknown): AppRouteHandle | undefined {
  if (!value || typeof value !== 'object') return undefined;
  return value as AppRouteHandle;
}
