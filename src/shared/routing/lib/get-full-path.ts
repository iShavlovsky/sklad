import type { AppRouteTree } from '@/shared/routing/types/route-contracts';

import { joinPaths } from './join-paths';

export function getFullPath(routeTree: AppRouteTree, routeId: string): string {
  const segments = routeId.split('.');
  const [head, ...tail] = segments;

  const root = routeTree[head];
  if (!root) {
    throw new Error(`Route node not found for routeId: ${routeId}`);
  }

  let fullPath = root.path;
  let current = root;

  for (const segment of tail) {
    const next = current.children?.[segment];

    if (!next) {
      throw new Error(`Route node not found for routeId: ${routeId}`);
    }

    fullPath = joinPaths(fullPath, next.path);
    current = next;
  }

  return fullPath || '/';
}
