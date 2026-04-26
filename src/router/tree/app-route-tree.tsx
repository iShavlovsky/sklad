import { Outlet } from 'react-router-dom';
import {
  IconArrowDown,
  IconArrowUp,
  IconBox,
  IconHome,
  IconListCheck,
  IconSettings,
} from '@tabler/icons-react';

import { ArrivalCreatePage } from '@/pages/arrivals/arrival-create-page.tsx';
import { ArrivalDetailsPage } from '@/pages/arrivals/arrival-details-page.tsx';
import { ArrivalEditPage } from '@/pages/arrivals/arrival-edit-page.tsx';
import { ArrivalsPage } from '@/pages/arrivals/arrivals-page.tsx';
import { BufferPage } from '@/pages/buffer/buffer-page.tsx';
import { DepartureCreatePage } from '@/pages/departures/departure-create-page.tsx';
import { DepartureDetailsPage } from '@/pages/departures/departure-details-page.tsx';
import { DepartureEditPage } from '@/pages/departures/departure-edit-page.tsx';
import { DeparturesPage } from '@/pages/departures/departures-page.tsx';
import { DraftCreatePage } from '@/pages/drafts/draft-create-page.tsx';
import { DraftDetailsPage } from '@/pages/drafts/draft-details-page.tsx';
import { DraftEditPage } from '@/pages/drafts/draft-edit-page.tsx';
import { DraftsPage } from '@/pages/drafts/drafts-page.tsx';
import { NotFoundPage } from '@/pages/not-found/not-found-page.tsx';
import { SettingsAboutPage } from '@/pages/settings/settings-about-page.tsx';
import { SettingsBackupPage } from '@/pages/settings/settings-backup-page.tsx';
import { SettingsPage } from '@/pages/settings/settings-page.tsx';
import { SettingsProfilePage } from '@/pages/settings/settings-profile-page.tsx';
import { StocksPage } from '@/pages/stocks';
import { StockDetailsPage } from '@/pages/stocks/stock-details-page.tsx';
import { RootLayout, RootRouteFallback } from '@/router/layouts/root-layout';
import type {
  AppRouteNode,
  AppRouteTree,
} from '@/shared/routing/types/route-contracts';

const routeOutlet = <Outlet />;

export const appRouteTree = {
  root: {
    path: '/',
    element: <RootLayout />,
    hydrateFallbackElement: <RootRouteFallback />,
    page: {
      title: 'SKLAD',
      description: 'Главный экран',
    },
    head: {
      title: 'SKLAD',
      description: 'Главный экран',
    },
    layout: {
      kind: 'default',
    },
    children: {
      dashboard: {
        index: true,
        path: '',
        lazy: async () => {
          const module = await import('@/pages/dashboard');
          return { Component: module.DashboardPage };
        },
        page: {
          title: 'Главная',
          description: 'центр быстрых действий',
        },
        head: {
          title: 'Главная - SKLAD',
          description: 'центр быстрых действий',
        },
        nav: {
          label: 'Главная',
          order: 0,
          icon: IconHome,
          mobileBottom: true,
          ariaLabel: 'Главная',
        },
      },
      arrivals: {
        path: 'arrivals',
        element: routeOutlet,
        page: {
          title: 'Приходы',
          description: 'список приходов',
        },
        head: {
          title: 'Приходы - SKLAD',
          description: 'список приходов',
        },
        nav: {
          label: 'Приходы',
          order: 1,
          icon: IconArrowDown,
          mobileBottom: true,
          ariaLabel: 'Приходы',
        },
        children: {
          index: {
            index: true,
            path: '',
            Component: ArrivalsPage,
            page: {
              title: 'Приходы',
              description: 'список приходов',
            },
            head: {
              title: 'Приходы - SKLAD',
              description: 'список приходов',
            },
          },
          create: {
            path: 'create',
            Component: ArrivalCreatePage,
            page: {
              title: 'Новый приход',
              description: 'создание прихода',
            },
            head: {
              title: 'Новый приход - SKLAD',
              description: 'создание прихода',
            },
          },
          details: {
            path: ':arrivalId',
            Component: ArrivalDetailsPage,
            page: {
              title: 'Карточка прихода',
              description: 'детали прихода',
            },
            head: {
              title: 'Карточка прихода - SKLAD',
              description: 'детали прихода',
            },
          },
          edit: {
            path: ':arrivalId/edit',
            Component: ArrivalEditPage,
            page: {
              title: 'Редактирование прихода',
              description: 'редактирование прихода',
            },
            head: {
              title: 'Редактирование прихода - SKLAD',
              description: 'редактирование прихода',
            },
          },
        },
      },
      departures: {
        path: 'departures',
        element: routeOutlet,
        page: {
          title: 'Расходы',
          description: 'список расходов',
        },
        head: {
          title: 'Расходы - SKLAD',
          description: 'список расходов',
        },
        nav: {
          label: 'Расходы',
          order: 2,
          icon: IconArrowUp,
          mobileBottom: true,
          ariaLabel: 'Расходы',
        },
        children: {
          index: {
            index: true,
            path: '',
            Component: DeparturesPage,
            page: {
              title: 'Расходы',
              description: 'список расходов',
            },
            head: {
              title: 'Расходы - SKLAD',
              description: 'список расходов',
            },
          },
          create: {
            path: 'create',
            Component: DepartureCreatePage,
            page: {
              title: 'Новый расход',
              description: 'route-owned create surface для расходов',
            },
            head: {
              title: 'Новый расход - SKLAD',
              description: 'route-owned create surface для расходов',
            },
          },
          details: {
            path: ':departureId',
            Component: DepartureDetailsPage,
            page: {
              title: 'Карточка расхода',
              description: 'детали расхода',
            },
            head: {
              title: 'Карточка расхода - SKLAD',
              description: 'детали расхода',
            },
          },
          edit: {
            path: ':departureId/edit',
            Component: DepartureEditPage,
            page: {
              title: 'Редактирование расхода',
              description: 'route-owned edit surface для расходов',
            },
            head: {
              title: 'Редактирование расхода - SKLAD',
              description: 'route-owned edit surface для расходов',
            },
          },
        },
      },
      drafts: {
        path: 'drafts',
        element: routeOutlet,
        page: {
          title: 'Черновики',
          description: 'список черновиков',
        },
        head: {
          title: 'Черновики - SKLAD',
          description: 'список черновиков',
        },
        children: {
          index: {
            index: true,
            path: '',
            Component: DraftsPage,
            page: {
              title: 'Черновики',
              description: 'список черновиков',
            },
            head: {
              title: 'Черновики - SKLAD',
              description: 'список черновиков',
            },
          },
          create: {
            path: 'create',
            Component: DraftCreatePage,
            page: {
              title: 'Новый черновик',
              description: 'route-owned create surface для черновиков',
            },
            head: {
              title: 'Новый черновик - SKLAD',
              description: 'route-owned create surface для черновиков',
            },
          },
          details: {
            path: ':draftId',
            Component: DraftDetailsPage,
            page: {
              title: 'Карточка черновика',
              description: 'детали черновика',
            },
            head: {
              title: 'Карточка черновика - SKLAD',
              description: 'детали черновика',
            },
          },
          edit: {
            path: ':draftId/edit',
            Component: DraftEditPage,
            page: {
              title: 'Редактирование черновика',
              description: 'route-owned edit surface для черновиков',
            },
            head: {
              title: 'Редактирование черновика - SKLAD',
              description: 'route-owned edit surface для черновиков',
            },
          },
        },
      },
      stocks: {
        path: 'stocks',
        element: routeOutlet,
        page: {
          title: 'Остатки',
          description: 'сводка по доступным остаткам',
        },
        head: {
          title: 'Остатки - SKLAD',
          description: 'сводка по доступным остаткам',
        },
        nav: {
          label: 'Остатки',
          order: 3,
          icon: IconBox,
          mobileBottom: true,
          ariaLabel: 'Остатки',
        },
        children: {
          index: {
            index: true,
            path: '',
            Component: StocksPage,
            page: {
              title: 'Остатки',
              description: 'сводка по доступным остаткам',
            },
            head: {
              title: 'Остатки - SKLAD',
              description: 'сводка по доступным остаткам',
            },
          },
          details: {
            path: ':stockId',
            Component: StockDetailsPage,
            page: {
              title: 'Карточка остатка',
              description: 'детали производной позиции остатков',
            },
            head: {
              title: 'Карточка остатка - SKLAD',
              description: 'детали производной позиции остатков',
            },
          },
        },
      },
      buffer: {
        path: 'buffer',
        element: <BufferPage />,
        page: {
          title: 'Буфер',
          description: 'управление общим буфером кодов',
        },
        head: {
          title: 'Буфер - SKLAD',
          description: 'управление общим буфером кодов',
        },
        nav: {
          label: 'Буфер',
          order: 20,
          icon: IconListCheck,
          mobileHeaderAction: true,
          ariaLabel: 'Буфер',
        },
      },
      settings: {
        path: 'settings',
        element: routeOutlet,
        page: {
          title: 'Настройки',
          description: 'маршруты персонализации',
        },
        head: {
          title: 'Настройки - SKLAD',
          description: 'маршруты персонализации',
        },
        nav: {
          label: 'Настройки',
          order: 30,
          icon: IconSettings,
          mobileHeaderAction: true,
          ariaLabel: 'Настройки',
        },
        layout: {
          kind: 'settings',
        },
        children: {
          index: {
            index: true,
            path: '',
            Component: SettingsPage,
            page: {
              title: 'Настройки',
              description: 'точка входа settings subtree',
            },
            head: {
              title: 'Настройки - SKLAD',
              description: 'точка входа settings subtree',
            },
          },
          profile: {
            path: 'profile',
            Component: SettingsProfilePage,
            page: {
              title: 'Профиль',
              description: 'настройки профиля',
            },
            head: {
              title: 'Профиль - SKLAD',
              description: 'настройки профиля',
            },
          },
          backup: {
            path: 'backup',
            Component: SettingsBackupPage,
            page: {
              title: 'Резервные копии',
              description: 'маршруты backup',
            },
            head: {
              title: 'Резервные копии - SKLAD',
              description: 'маршруты backup',
            },
          },
          about: {
            path: 'about',
            Component: SettingsAboutPage,
            page: {
              title: 'О приложении',
              description: 'сведения о приложении',
            },
            head: {
              title: 'О приложении - SKLAD',
              description: 'сведения о приложении',
            },
          },
        },
      },
      notFound: {
        path: '*',
        Component: NotFoundPage,
        page: {
          title: '404',
          description: 'страница не найдена',
        },
        head: {
          title: '404 - SKLAD',
          description: 'страница не найдена',
          robots: 'noindex,nofollow',
        },
        nav: {
          label: '404',
          hidden: true,
        },
      },
    },
  },
} as const satisfies AppRouteTree;

if (import.meta.env.DEV) {
  (appRouteTree.root.children as Record<string, AppRouteNode>).uiKit = {
    path: 'ui-kit',
    lazy: async () => {
      const module = await import('@/pages/ui-kit');
      return { Component: module.UiKitPage };
    },
    page: {
      title: 'UI Kit',
      description: 'каноническая проверочная поверхность темы',
    },
    head: {
      title: 'UI Kit - SKLAD',
      description: 'каноническая проверочная поверхность темы',
    },
    layout: {
      kind: 'fullscreen',
    },
  };

  (appRouteTree as Record<string, AppRouteNode>).devicePreview = {
    path: 'device-preview',
    lazy: async () => {
      const module = await import('@/pages/device-preview');
      return { Component: module.DevicePreviewPage };
    },
    page: {
      title: 'Просмотр устройства',
      description:
        'внешняя проверочная поверхность с пресетами устройств и настраиваемым DPR',
    },
    head: {
      title: 'Просмотр устройства - SKLAD',
      description:
        'внешняя проверочная поверхность с пресетами устройств и настраиваемым DPR',
    },
    layout: {
      kind: 'fullscreen',
    },
    nav: {
      label: 'Просмотр устройства',
      hidden: true,
    },
  };
}
