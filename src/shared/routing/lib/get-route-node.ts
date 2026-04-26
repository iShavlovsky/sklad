import type {
  AppRouteNode,
  AppRouteTree,
} from '@/shared/routing/types/route-contracts';

import { invariantRouteNode } from './invariant-route-node';

export function getRouteNode(
  routeTree: AppRouteTree,
  routeId: string
): AppRouteNode {
  const segments = routeId.split('.');
  const [head, ...tail] = segments;

  let current = invariantRouteNode(routeTree[head], routeId);

  for (const segment of tail) {
    current = invariantRouteNode(current.children?.[segment], routeId);
  }

  return current;
}
