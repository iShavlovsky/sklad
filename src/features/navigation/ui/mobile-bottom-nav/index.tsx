import type { ReactElement } from 'react';

import { mobileBottomNavRouteIds } from './bottom-navigation.constants';
import type { MobileBottomNavProps } from './bottom-navigation.types';
import { MobileBottomNavItems } from './mobile-bottom-nav-items';

export function MobileBottomNav({
  routeIds = mobileBottomNavRouteIds,
}: Readonly<MobileBottomNavProps>): ReactElement {
  return <MobileBottomNavItems routeIds={routeIds} />;
}

export { BottomNavigation } from './bottom-navigation';
export type {
  BottomNavigationItemConfig,
  BottomNavigationProps,
} from './bottom-navigation.types';
