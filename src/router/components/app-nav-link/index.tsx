import { NavLink, type NavLinkProps } from 'react-router-dom';

import { buildPath } from '@/shared/routing/lib/build-path';

import { appRouteTree } from '../../tree/app-route-tree';
import type { AppRouteId, AppRouteParams } from '../../types/app-route-types';

type BaseAppNavLinkProps = Omit<NavLinkProps, 'to'>;

type AppNavLinkProps<TRouteId extends AppRouteId> =
  AppRouteParams<TRouteId> extends undefined
    ? BaseAppNavLinkProps & {
        routeId: TRouteId;
        params?: undefined;
      }
    : BaseAppNavLinkProps & {
        routeId: TRouteId;
        params: AppRouteParams<TRouteId>;
      };

export function AppNavLink<TRouteId extends AppRouteId>({
  routeId,
  params,
  ...props
}: AppNavLinkProps<TRouteId>) {
  const to = buildPath(
    appRouteTree,
    routeId,
    params as Record<string, string | number> | undefined
  );

  return <NavLink to={to} {...props} />;
}
