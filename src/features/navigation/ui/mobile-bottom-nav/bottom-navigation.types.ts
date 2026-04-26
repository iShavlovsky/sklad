import type { ComponentType } from 'react';

import type { AppRouteId } from '@/router';
import type { EntityIconTone } from '@/shared/ui/entity-icon-tones';

export type BottomNavigationRouteId =
  | 'root.dashboard'
  | 'root.arrivals'
  | 'root.departures'
  | 'root.stocks';

export interface BottomNavigationIconProps {
  size?: number;
  stroke?: number;
}

export type BottomNavigationIcon = ComponentType<BottomNavigationIconProps>;

export interface BottomNavigationItemConfig {
  ariaLabel: string;
  disabled?: boolean;
  icon?: BottomNavigationIcon;
  id: string;
  indicator?: boolean;
  label: string;
  tone?: EntityIconTone;
}

export interface BottomNavigationProps {
  ariaLabel: string;
  focusVisibleId?: string;
  items: BottomNavigationItemConfig[];
  onChange?: (value: string) => void;
  pressedId?: string;
  value: string;
}

export interface MobileBottomNavProps {
  routeIds?: readonly BottomNavigationRouteId[];
}

export type RouteAwareDefinition = {
  ariaLabel: string;
  icon?: BottomNavigationIcon;
  label: string;
  routeId: AppRouteId;
};
