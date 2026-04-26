import { useMatches } from 'react-router-dom';

import { asRouteHandle } from '@/shared/routing/lib/as-route-handle';
import type { ResolvedRouteMeta } from '@/shared/routing/types/route-meta';

export function useRouteMeta(): ResolvedRouteMeta | undefined {
  const matches = useMatches();
  const current = matches.at(-1);
  const handle = asRouteHandle(current?.handle);

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
