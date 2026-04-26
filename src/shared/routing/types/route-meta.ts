import type { ComponentType } from 'react';
import type { Params } from 'react-router-dom';

export type BreadcrumbLabelResolver = (params: Params<string>) => string;

export type AppPageMeta = {
  title: string;
  description?: string;
};

export type AppHeadMeta = {
  title?: string;
  description?: string;
  robots?: string;
};

export type AppNavMeta = {
  label?: string;
  hidden?: boolean;
  order?: number;
  icon?: ComponentType<{ size?: number; stroke?: number }>;
  ariaLabel?: string;
  mobileBottom?: boolean;
  mobileHeaderAction?: boolean;
};

export type AppAccessMeta = {
  auth?: 'any' | 'guest' | 'user';
  permissions?: string[];
};

export type AppBreadcrumbsMeta = {
  label?: string | BreadcrumbLabelResolver;
};

export type AppLayoutMeta = {
  kind?: 'default' | 'settings' | 'fullscreen';
};

export type AppRouteHandle = {
  page?: AppPageMeta;
  head?: AppHeadMeta;
  nav?: AppNavMeta;
  access?: AppAccessMeta;
  breadcrumbs?: AppBreadcrumbsMeta;
  layout?: AppLayoutMeta;
};

export type ResolvedRouteMeta = AppRouteHandle;
