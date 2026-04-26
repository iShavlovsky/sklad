import { useNavigate } from 'react-router-dom';

import { buildPath } from '@/shared/routing/lib/build-path';

import { appRouteTree } from '../tree/app-route-tree';
import type { AppRouteId, AppRouteParams } from '../types/app-route-types';

type BaseNavigateOptions = {
  replace?: boolean;
  state?: unknown;
};

type NavigateOptions<TRouteId extends AppRouteId> =
  AppRouteParams<TRouteId> extends undefined
    ? BaseNavigateOptions & { params?: undefined }
    : BaseNavigateOptions & { params: AppRouteParams<TRouteId> };

export function useAppNavigate() {
  const navigate = useNavigate();

  return {
    to<TRouteId extends AppRouteId>(
      routeId: TRouteId,
      options?: NavigateOptions<TRouteId>
    ): void {
      const targetPath = buildPath(
        appRouteTree,
        routeId,
        options?.params as Record<string, string | number> | undefined
      );

      navigate(targetPath, {
        replace: options?.replace,
        state: options?.state,
      });
    },

    back(): void {
      navigate(-1);
    },

    forward(): void {
      navigate(1);
    },
  };
}
