import type { ReactElement } from 'react';
import { NavLink as RouterNavLink, useLocation } from 'react-router-dom';
import { NavLink } from '@mantine/core';
import { IconChevronRight } from '@tabler/icons-react';

import type { APP_ROUTES } from '@/shared/config/routes.ts';

type SettingsHubLinkProps = {
  description: string;
  icon: ReactElement;
  label: string;
  to:
    | typeof APP_ROUTES.settingsProfile
    | typeof APP_ROUTES.settingsBackup
    | typeof APP_ROUTES.settingsAbout;
};

export function SettingsHubLink({
  description,
  icon,
  label,
  to,
}: Readonly<SettingsHubLinkProps>): ReactElement {
  const location = useLocation();

  return (
    <NavLink
      active={location.pathname === to}
      component={RouterNavLink}
      data-testid={`settings-nav-${to.split('/').at(-1)}`}
      description={description}
      label={label}
      leftSection={icon}
      rightSection={<IconChevronRight size={14} />}
      to={to}
      variant="light"
    />
  );
}
