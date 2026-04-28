import type { ComponentType, ReactElement } from 'react';
import { NavLink as RouterNavLink, useLocation } from 'react-router-dom';
import { Divider, Drawer, NavLink, Stack, Text } from '@mantine/core';
import {
  IconArrowDown,
  IconArrowUp,
  IconBox,
  IconHome,
  IconInfoCircle,
  IconListCheck,
  IconPackage,
  IconSettings,
  IconUser,
} from '@tabler/icons-react';

import { APP_ROUTES } from '@/shared/config/routes.ts';

type ShellMenuItem = {
  description: string;
  icon: ComponentType<{ size?: number; stroke?: number }>;
  label: string;
  to: string;
};

type ShellMenuGroup = {
  items: ShellMenuItem[];
  title: string;
};

const shellMenuGroups: ShellMenuGroup[] = [
  {
    title: 'Работа',
    items: [
      {
        description: 'Сводка и быстрые действия',
        icon: IconHome,
        label: 'Главная',
        to: APP_ROUTES.dashboard,
      },
      {
        description: 'Журнал поступлений',
        icon: IconArrowDown,
        label: 'Приходы',
        to: APP_ROUTES.arrivals,
      },
      {
        description: 'Журнал отгрузок',
        icon: IconArrowUp,
        label: 'Отгрузки',
        to: APP_ROUTES.departures,
      },
      {
        description: 'Производная сводка по доступным позициям',
        icon: IconBox,
        label: 'Остатки',
        to: APP_ROUTES.stocks,
      },
      {
        description: 'Незавершённые записи',
        icon: IconListCheck,
        label: 'Черновики',
        to: APP_ROUTES.drafts,
      },
    ],
  },
  {
    title: 'Справочники',
    items: [
      {
        description: 'Поиск и редактирование карточек',
        icon: IconPackage,
        label: 'Все товары',
        to: APP_ROUTES.products,
      },
      {
        description: 'Общий список кодов из сканера',
        icon: IconListCheck,
        label: 'Буфер',
        to: APP_ROUTES.buffer,
      },
    ],
  },
  {
    title: 'Система',
    items: [
      {
        description: 'Параметры приложения',
        icon: IconSettings,
        label: 'Настройки',
        to: APP_ROUTES.settings,
      },
      {
        description: 'Имя и персональные данные',
        icon: IconUser,
        label: 'Профиль',
        to: APP_ROUTES.settingsProfile,
      },
      {
        description: 'Экспорт, импорт и восстановление',
        icon: IconSettings,
        label: 'Резервные копии',
        to: APP_ROUTES.settingsBackup,
      },
      {
        description: 'Версия и сведения о приложении',
        icon: IconInfoCircle,
        label: 'О приложении',
        to: APP_ROUTES.settingsAbout,
      },
    ],
  },
];

function isRouteActive(pathname: string, target: string): boolean {
  if (target === APP_ROUTES.dashboard) {
    return pathname === target;
  }

  return pathname === target || pathname.startsWith(`${target}/`);
}

export function ShellMenuDrawer({
  onClose,
  opened,
}: Readonly<{
  onClose: () => void;
  opened: boolean;
}>): ReactElement {
  const location = useLocation();

  return (
    <Drawer
      onClose={onClose}
      opened={opened}
      position="right"
      size="min(22rem, calc(100vw - 2rem))"
      styles={{
        body: {
          flex: '1 1 auto',
          background: 'transparent',
          minHeight: 0,
          overflowY: 'auto',
          paddingTop: 'var(--mantine-spacing-md)',
        },
        content: {
          background:
            'linear-gradient(180deg, var(--sl-surface-glass-strong), var(--sl-surface-glass))',
          border: '1px solid var(--sl-surface-glass-border)',
          boxShadow: 'var(--sl-glass-shadow)',
          backdropFilter: 'blur(var(--sl-glass-blur))',
          WebkitBackdropFilter: 'blur(var(--sl-glass-blur))',
          display: 'flex',
          flexDirection: 'column',
          maxHeight: '100dvh',
          overflow: 'hidden',
        },
        header: {
          flex: '0 0 auto',
          background:
            'linear-gradient(180deg, var(--sl-surface-glass-strong), var(--sl-surface-glass-strong))',
          backdropFilter: 'blur(var(--sl-glass-blur))',
          borderBottom: '1px solid var(--sl-surface-glass-border)',
          boxShadow:
            '0 0.75rem 1.25rem color-mix(in srgb, var(--sl-surface-glass-strong) 72%, transparent)',
          WebkitBackdropFilter: 'blur(var(--sl-glass-blur))',
          zIndex: 1,
        },
      }}
      title="Меню"
      zIndex={320}
    >
      <Stack gap="md">
        {shellMenuGroups.map((group, groupIndex) => (
          <Stack gap="xs" key={group.title}>
            {groupIndex > 0 ? <Divider /> : null}
            <Text c="dimmed" fw={700} size="xs" tt="uppercase">
              {group.title}
            </Text>
            <Stack gap={4}>
              {group.items.map((item) => {
                const Icon = item.icon;

                return (
                  <NavLink
                    active={isRouteActive(location.pathname, item.to)}
                    component={RouterNavLink}
                    description={item.description}
                    key={item.to}
                    label={item.label}
                    leftSection={<Icon size={16} stroke={1.75} />}
                    onClick={onClose}
                    to={item.to}
                    variant="light"
                  />
                );
              })}
            </Stack>
          </Stack>
        ))}
      </Stack>
    </Drawer>
  );
}
