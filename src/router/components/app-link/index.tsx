import type { CSSProperties } from 'react';
import { Link, type LinkProps } from 'react-router-dom';

import { buildPath } from '@/shared/routing/lib/build-path';

import { appRouteTree } from '../../tree/app-route-tree';
import type { AppRouteId, AppRouteParams } from '../../types/app-route-types';

type BaseAppLinkProps = Omit<LinkProps, 'to'>;

type AppLinkProps<TRouteId extends AppRouteId> =
  AppRouteParams<TRouteId> extends undefined
    ? BaseAppLinkProps & {
        routeId: TRouteId;
        params?: undefined;
      }
    : BaseAppLinkProps & {
        routeId: TRouteId;
        params: AppRouteParams<TRouteId>;
      };

const appLinkStyle: CSSProperties = {
  color: 'inherit',
  textDecoration: 'none',
};

export function AppLink<TRouteId extends AppRouteId>({
  routeId,
  params,
  style,
  ...props
}: AppLinkProps<TRouteId>) {
  const to = buildPath(
    appRouteTree,
    routeId,
    params as Record<string, string | number> | undefined
  );

  return <Link to={to} style={{ ...appLinkStyle, ...style }} {...props} />;
}
