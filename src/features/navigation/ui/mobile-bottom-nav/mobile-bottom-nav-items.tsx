import type { ReactElement } from 'react';
import { useLocation } from 'react-router-dom';

import { appRouteTree, useAppNavigate } from '@/router';
import { useSwipeAction } from '@/shared/gestures';
import { useHaptics } from '@/shared/haptics';
import { buildPath } from '@/shared/routing/lib/build-path';
import { getRouteNode } from '@/shared/routing/lib/get-route-node';
import type { EntityIconTone } from '@/shared/ui/entity-icon-tones';

import { BottomNavigation } from './bottom-navigation';
import type {
  BottomNavigationItemConfig,
  BottomNavigationRouteId,
  RouteAwareDefinition,
} from './bottom-navigation.types';

const mobileBottomNavCopy: Record<
  BottomNavigationRouteId,
  { ariaLabel: string; label: string }
> = {
  'root.arrivals': {
    ariaLabel: 'Приход',
    label: 'Приход',
  },
  'root.dashboard': {
    ariaLabel: 'Главная',
    label: 'Главная',
  },
  'root.departures': {
    ariaLabel: 'Отгрузка',
    label: 'Отгрузка',
  },
  'root.stocks': {
    ariaLabel: 'Остатки',
    label: 'Остатки',
  },
};

function getRouteAwareBottomNavigationItem(
  routeId: BottomNavigationRouteId
): RouteAwareDefinition {
  const route = getRouteNode(appRouteTree, routeId);
  const copy = mobileBottomNavCopy[routeId];

  return {
    ariaLabel:
      copy.ariaLabel ??
      route.nav?.ariaLabel ??
      route.nav?.label ??
      route.page?.title ??
      routeId,
    icon: route.nav?.icon,
    label: copy.label ?? route.nav?.label ?? route.page?.title ?? routeId,
    routeId,
  };
}

const routeToneMap: Record<BottomNavigationRouteId, EntityIconTone> = {
  'root.arrivals': 'arrival',
  'root.dashboard': 'dashboard',
  'root.departures': 'departure',
  'root.stocks': 'stocks',
};

type MobileBottomNavItemsProps = {
  routeIds: readonly BottomNavigationRouteId[];
};

export function MobileBottomNavItems({
  routeIds,
}: Readonly<MobileBottomNavItemsProps>): ReactElement {
  const location = useLocation();
  const navigate = useAppNavigate();
  const haptics = useHaptics();
  const items = routeIds.map((routeId): BottomNavigationItemConfig => {
    const route = getRouteAwareBottomNavigationItem(routeId);

    return {
      ariaLabel: route.ariaLabel,
      icon: route.icon,
      id: routeId,
      label: route.label,
      tone: routeToneMap[routeId],
    };
  });
  const activeRouteId =
    routeIds.find((routeId) => {
      const routePath = buildPath(appRouteTree, routeId);

      if (routeId === 'root.dashboard') {
        return location.pathname === routePath;
      }

      return (
        location.pathname === routePath ||
        location.pathname.startsWith(`${routePath}/`)
      );
    }) ?? null;
  const swipeNavigation = useSwipeAction({
    enabled: activeRouteId !== null && routeIds.length > 1,
    onSwipe: (direction) => {
      if (activeRouteId === null) {
        return;
      }

      const activeRouteIndex = routeIds.indexOf(activeRouteId);
      if (activeRouteIndex === -1) {
        return;
      }

      const nextRouteId =
        direction === 'left'
          ? (routeIds[activeRouteIndex + 1] ?? null)
          : direction === 'right'
            ? (routeIds[activeRouteIndex - 1] ?? null)
            : null;

      if (nextRouteId === null) {
        return;
      }

      void haptics.trigger('selection');
      navigate.to(nextRouteId);
    },
  });

  return (
    <div
      {...swipeNavigation.bind()}
      className="mobile-bottom-nav"
      style={{ touchAction: swipeNavigation.touchAction }}
    >
      <BottomNavigation
        ariaLabel="Основная навигация"
        items={items}
        onChange={(nextRouteId) => {
          void haptics.trigger('selection');
          navigate.to(nextRouteId as BottomNavigationRouteId);
        }}
        value={activeRouteId ?? '__none__'}
      />
    </div>
  );
}
