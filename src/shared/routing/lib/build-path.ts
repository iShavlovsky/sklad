import { generatePath } from 'react-router-dom';

import type { AppRouteTree } from '@/shared/routing/types/route-contracts';

import { getFullPath } from './get-full-path';

export function buildPath(
  routeTree: AppRouteTree,
  routeId: string,
  params?: Record<string, string | number>
): string {
  const fullPath = getFullPath(routeTree, routeId);

  if (!params) return fullPath;

  const normalizedParams = Object.fromEntries(
    Object.entries(params).map(([key, value]) => [key, String(value)])
  );

  return generatePath(fullPath, normalizedParams);
}
