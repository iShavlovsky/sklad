import type { BottomNavigationRouteId } from './bottom-navigation.types';

export const mobileBottomNavRouteIds = [
  'root.dashboard',
  'root.arrivals',
  'root.departures',
  'root.stocks',
] as const satisfies readonly BottomNavigationRouteId[];
