import type { ReactElement } from 'react';
import {
  ActionIcon,
  Badge,
  Group,
  Popover,
  Stack,
  Text,
  ThemeIcon,
  Tooltip,
} from '@mantine/core';
import { useDisclosure, useNetwork } from '@mantine/hooks';
import {
  IconArrowDown,
  IconArrowUp,
  IconBox,
  IconListCheck,
  IconNotes,
  IconWifi,
  IconWifiOff,
} from '@tabler/icons-react';

import {
  type TelemetryIconKey,
  useTelemetry,
} from '@/features/dashboard/model/use-telemetry.ts';
import {
  type EntityIconTone,
  getEntityAccentSurfaceStyle,
} from '@/shared/ui/entity-icon-tones.ts';

const telemetryIconMap: Record<TelemetryIconKey, typeof IconWifi> = {
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

export function MobileShellNetworkStatus(): ReactElement {
  const network = useNetwork();
  const [opened, disclosure] = useDisclosure(false);
  const telemetry = useTelemetry();
  const statusLabel = network.online ? 'Онлайн' : 'Офлайн';
  const NetworkIcon = network.online ? IconWifi : IconWifiOff;

  return (
    <Popover
      opened={opened}
      onChange={(nextOpened) => {
        if (nextOpened) {
          disclosure.open();
          return;
        }

        disclosure.close();
      }}
      position="bottom-end"
      shadow="md"
      width="clamp(12rem, 46vw, 13.75rem)"
      withArrow
      withinPortal
    >
      <Popover.Target>
        <Tooltip label="Статус сети">
          <ActionIcon
            aria-label="Статус сети"
            className="mobile-shell__utility"
            color={network.online ? 'teal' : 'red'}
            data-testid="shell-network-status"
            h="var(--sl-mobile-control-height)"
            mih="var(--sl-mobile-control-height)"
            miw="var(--sl-mobile-control-height)"
            onClick={disclosure.toggle}
            size="md"
            variant="light"
          >
            <NetworkIcon size={16} stroke={1.85} />
          </ActionIcon>
        </Tooltip>
      </Popover.Target>

      <Popover.Dropdown>
        <Stack
          align="stretch"
          className="mobile-shell__network-popover"
          data-testid="shell-network-popover"
          gap="0.5rem"
          w="100%"
        >
          <Group gap="0.5rem" wrap="nowrap">
            <ThemeIcon
              aria-hidden="true"
              className="mobile-shell__network-popover-icon"
              color={network.online ? 'teal' : 'red'}
              flex="0 0 auto"
              radius="xl"
              size="1.5rem"
              variant="light"
            >
              <NetworkIcon size={14} stroke={1.85} />
            </ThemeIcon>
            <Badge
              color={network.online ? 'teal' : 'red'}
              radius="sm"
              variant="light"
            >
              {statusLabel}
            </Badge>
          </Group>

          <Stack
            className="mobile-shell__telemetry-list"
            component="ul"
            gap="0.375rem"
            m={0}
            p={0}
            style={{ listStyle: 'none', width: '100%' }}
          >
            {telemetry.map((item) => {
              const Icon = telemetryIconMap[item.icon];
              const tone = telemetryToneMap[item.icon];

              return (
                <Group
                  className="mobile-shell__telemetry-row"
                  component="li"
                  gap="0.5rem"
                  justify="space-between"
                  key={item.id}
                  m={0}
                  w="100%"
                  wrap="nowrap"
                >
                  <Group
                    className="mobile-shell__telemetry-row-meta"
                    gap="0.375rem"
                    miw={0}
                    wrap="nowrap"
                  >
                    <ThemeIcon
                      aria-hidden="true"
                      className="mobile-shell__telemetry-row-icon"
                      flex="0 0 auto"
                      radius="xl"
                      size="1.125rem"
                      style={getEntityAccentSurfaceStyle(tone)}
                      variant="light"
                    >
                      <Icon size={11} stroke={1.9} />
                    </ThemeIcon>
                    <Text
                      c="var(--sl-muted-text)"
                      className="mobile-shell__telemetry-row-label"
                      miw={0}
                      size="xs"
                      truncate="end"
                    >
                      {item.label}
                    </Text>
                  </Group>
                  <Text
                    className="mobile-shell__telemetry-row-value"
                    flex="0 0 auto"
                    fw={800}
                    miw="1.5rem"
                    size="sm"
                    ta="right"
                    style={{ fontVariantNumeric: 'tabular-nums' }}
                  >
                    {item.value}
                  </Text>
                </Group>
              );
            })}
          </Stack>
        </Stack>
      </Popover.Dropdown>
    </Popover>
  );
}
