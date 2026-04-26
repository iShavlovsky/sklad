import { matchRoutes } from 'react-router-dom';

import type { AppRouteTree } from '@/shared/routing/types/route-contracts';
import type { ResolvedRouteMeta } from '@/shared/routing/types/route-meta';

import { asRouteHandle } from './as-route-handle';
import { buildRouteObjects } from './build-route-objects';

export function getRouteMetaByPath(
  routeTree: AppRouteTree,
  pathname: string
): ResolvedRouteMeta | undefined {
  const matches = matchRoutes(buildRouteObjects(routeTree), pathname);
  const current = matches?.at(-1);
  const handle = asRouteHandle(current?.route.handle);

  if (!handle) return undefined;

  return {
    page: handle.page,
    head: handle.head,
    nav: handle.nav,
    access: handle.access,
    breadcrumbs: handle.breadcrumbs,
    layout: handle.layout,
  };
}
