import type { AppRouteNode } from '@/shared/routing/types/route-contracts';

export function invariantRouteNode(
  value: AppRouteNode | undefined,
  routeId: string
): AppRouteNode {
  if (!value) throw new Error(`Route node not found for routeId: ${routeId}`);
  return value;
}
