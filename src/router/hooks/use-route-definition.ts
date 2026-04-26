import { getRouteNode } from '@/shared/routing/lib/get-route-node';

import { appRouteTree } from '../tree/app-route-tree';
import type { AppRouteId, AppRouteNodeById } from '../types/app-route-types';

export function useRouteDefinition<TRouteId extends AppRouteId>(
  routeId: TRouteId
): AppRouteNodeById<TRouteId> {
  return getRouteNode(appRouteTree, routeId) as AppRouteNodeById<TRouteId>;
}
