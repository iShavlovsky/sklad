import type { ReactElement } from 'react';
import { useState } from 'react';
import {
  ActionIcon,
  Paper,
  SimpleGrid,
  Text,
  ThemeIcon,
  Tooltip,
} from '@mantine/core';
import {
  IconArrowDown,
  IconArrowUp,
  IconBox,
  IconListCheck,
  IconNotes,
  IconPinned,
  IconPinnedOff,
  type IconQrcode,
} from '@tabler/icons-react';

import {
  type TelemetryIconKey,
  useTelemetry,
} from '@/features/dashboard/model/use-telemetry.ts';
import {
  type EntityIconTone,
  getEntityAccentSurfaceStyle,
} from '@/shared/ui/entity-icon-tones.ts';
import {
  BottomSpacer,
  PageContainer,
  SectionStack,
} from '@/shared/ui/page-primitives';
import { PageSection } from '@/shared/ui/page-section';

import { HomeFavorites } from './home-favorites';

import styles from './styles.module.css';

const telemetryIconMap: Record<TelemetryIconKey, typeof IconQrcode> = {
  arrivals: IconArrowDown,
  departures: IconArrowUp,
  drafts: IconNotes,
  stocks: IconBox,
  buffer: IconListCheck,
};

const telemetryToneMap: Record<TelemetryIconKey, EntityIconTone> = {
  arrivals: 'arrival',
  departures: 'departure',
  drafts: 'drafts',
  stocks: 'stocks',
  buffer: 'buffer',
};

export function DashboardPage(): ReactElement {
  const telemetry = useTelemetry();
  const [isFavoritesReorderEnabled, setIsFavoritesReorderEnabled] =
    useState(false);

  return (
    <PageContainer>
      <SectionStack>
        <PageSection
          badge="Телеметрия"
          help="Краткий срез текущего состояния приходов, расходов, черновиков, остатков и буфера."
        >
          <SimpleGrid cols={2} spacing={6} verticalSpacing={6}>
            {telemetry.map((item) => {
              const Icon = telemetryIconMap[item.icon];
              const tone = telemetryToneMap[item.icon];

              return (
                <Paper
                  bg="color-mix(in srgb, var(--sl-surface-card) 94%, var(--sl-surface-highlight))"
                  className={`${styles.telemetryRow} home-telemetry-row`}
                  key={item.id}
                  px={9}
                  py={7}
                >
                  <div
                    className={`${styles.telemetryRowMeta} home-telemetry-row__meta`}
                  >
                    <ThemeIcon
                      radius="xl"
                      size={18}
                      style={getEntityAccentSurfaceStyle(tone)}
                      variant="light"
                    >
                      <Icon size={11} stroke={1.9} />
                    </ThemeIcon>
                    <Text
                      className={`${styles.telemetryCardLabel} home-telemetry-card__label`}
                      size="xs"
                    >
                      {item.label}
                    </Text>
                  </div>
                  <Paper
                    className={`${styles.telemetryCardValue} home-telemetry-card__value`}
                    component="span"
                    px={8}
                    py={3}
                    radius="pill"
                    withBorder
                  >
                    {item.value}
                  </Paper>
                </Paper>
              );
            })}
          </SimpleGrid>
        </PageSection>

        <PageSection
          badge="Избранное"
          help="Набор быстрых действий для частых сценариев. Плитки можно переставлять drag-and-drop за ручку, новый порядок сохраняется. Сканер открывает глобальный overlay, остальные плитки ведут на маршруты."
          trailing={
            <Tooltip
              label={
                isFavoritesReorderEnabled
                  ? 'Заблокировать перемещение'
                  : 'Разблокировать перемещение'
              }
            >
              <ActionIcon
                aria-label={
                  isFavoritesReorderEnabled
                    ? 'Заблокировать перемещение'
                    : 'Разблокировать перемещение'
                }
                onClick={() =>
                  setIsFavoritesReorderEnabled((current) => !current)
                }
                size={24}
                variant={isFavoritesReorderEnabled ? 'filled' : 'light'}
              >
                {isFavoritesReorderEnabled ? (
                  <IconPinnedOff size={16} stroke={1.8} />
                ) : (
                  <IconPinned size={16} stroke={1.8} />
                )}
              </ActionIcon>
            </Tooltip>
          }
        >
          <HomeFavorites isReorderEnabled={isFavoritesReorderEnabled} />
        </PageSection>
      </SectionStack>

      <BottomSpacer />
    </PageContainer>
  );
}
