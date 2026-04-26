import type { RouteObject } from 'react-router-dom';

import type {
  AppRouteNode,
  AppRouteTree,
} from '@/shared/routing/types/route-contracts';
import type { AppRouteHandle } from '@/shared/routing/types/route-meta';

const isDevelopment = import.meta.env.DEV;

function toHandle(node: AppRouteNode): AppRouteHandle {
  return {
    page: node.page,
    head: node.head,
    nav: node.nav,
    access: node.access,
    breadcrumbs: node.breadcrumbs,
    layout: node.layout,
  };
}

function mapNodeToRouteObject(node: AppRouteNode): RouteObject {
  const routeObject: RouteObject = {
    path: node.index ? undefined : node.path,
    index: node.index,
    element: node.element,
    Component: node.Component,
    errorElement: node.errorElement,
    hydrateFallbackElement: node.hydrateFallbackElement,
    loader: node.loader,
    action: node.action,
    lazy: node.lazy,
    handle: toHandle(node),
  };

  if (node.children) {
    routeObject.children = Object.values(node.children)
      .filter((childNode) => isDevelopment || childNode.devOnly !== true)
      .map(mapNodeToRouteObject);
  }

  return routeObject;
}

export function buildRouteObjects(routeTree: AppRouteTree): RouteObject[] {
  return Object.values(routeTree)
    .filter((node) => isDevelopment || node.devOnly !== true)
    .map(mapNodeToRouteObject);
}
