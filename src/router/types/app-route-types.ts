import type { AppRouteTree } from '@/shared/routing/types/route-contracts';
import type { RouteIdOf } from '@/shared/routing/types/route-ids';
import type { RouteNodeById } from '@/shared/routing/types/route-node-by-id';
import type {
  FullPathOf,
  RouteParamsOf,
} from '@/shared/routing/types/route-params';

import { type appRouteTree } from '../tree/app-route-tree';

export type AppRoutes = typeof appRouteTree;
export type AppRouteId = RouteIdOf<AppRoutes>;
export type AppRouteNodeById<TRouteId extends AppRouteId> = RouteNodeById<
  AppRoutes,
  TRouteId
>;
export type AppRouteParams<TRouteId extends AppRouteId> = RouteParamsOf<
  AppRoutes,
  TRouteId
>;
export type AppFullPath<TRouteId extends AppRouteId> = FullPathOf<
  AppRoutes,
  TRouteId
>;

export type EnsureTree = AppRoutes extends AppRouteTree ? true : false;
