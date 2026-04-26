import type { ReactNode } from 'react';
import type {
  ActionFunction,
  LazyRouteFunction,
  LoaderFunction,
  RouteObject,
} from 'react-router-dom';

import type {
  AppAccessMeta,
  AppBreadcrumbsMeta,
  AppHeadMeta,
  AppLayoutMeta,
  AppNavMeta,
  AppPageMeta,
} from './route-meta';

export type AppRouteNode = {
  path: string;
  index?: boolean;
  devOnly?: boolean;

  page?: AppPageMeta;
  head?: AppHeadMeta;
  nav?: AppNavMeta;
  access?: AppAccessMeta;
  breadcrumbs?: AppBreadcrumbsMeta;
  layout?: AppLayoutMeta;

  element?: ReactNode;
  Component?: RouteObject['Component'];
  errorElement?: ReactNode;
  hydrateFallbackElement?: ReactNode;
  loader?: LoaderFunction;
  action?: ActionFunction;
  lazy?: LazyRouteFunction<RouteObject>;

  children?: Record<string, AppRouteNode>;
};

export type AppRouteTree = Record<string, AppRouteNode>;
