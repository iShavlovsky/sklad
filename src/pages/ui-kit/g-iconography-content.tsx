import type { ReactElement } from 'react';
import {
  ActionIcon,
  Badge,
  Group,
  Paper,
  SimpleGrid,
  Stack,
  Table,
  Text,
  ThemeIcon,
  Title,
} from '@mantine/core';
import {
  IconAlertTriangle,
  IconArchive,
  IconArrowBarToDown,
  IconCheck,
  IconCopy,
  IconDeviceFloppy,
  IconHome2,
  IconInfoCircle,
  IconListCheck,
  IconPackage,
  IconQrcode,
  IconSearch,
  IconSettings,
  IconTruckDelivery,
} from '@tabler/icons-react';

import {
  appIconographyGuidance,
  appIconPack,
  appIconSizeTokens,
  appIconStrokeWidth,
  appIconUsageTokens,
  getAppIconProps,
} from '@/app/theme';
import { PageSection } from '@/shared/ui/page-section';

type IconRoleItem = {
  description: string;
  role: string;
  sizeKey: keyof typeof appIconSizeTokens;
};

type IconGridItem = {
  category: string;
  icon: typeof IconArchive;
  label: string;
};

const sizeGuidanceRows: IconRoleItem[] = [
  {
    description: 'Подписи, короткие статусы, inline markers',
    role: 'Inline',
    sizeKey: appIconUsageTokens.inline,
  },
  {
    description: 'Подсказки, help affordances, input sections',
    role: 'Helper / field',
    sizeKey: appIconUsageTokens.helper,
  },
  {
    description: 'Плотные utility actions внутри компактных tool rows',
    role: 'Compact action',
    sizeKey: appIconUsageTokens.actionCompact,
  },
  {
    description: 'Основные touch-first action icons и shell utilities',
    role: 'Touch action',
    sizeKey: appIconUsageTokens.actionTouch,
  },
  {
    description: 'Навигация и route-level affordances',
    role: 'Navigation',
    sizeKey: appIconUsageTokens.navigation,
  },
  {
    description: 'Крупные emphasis/demo markers',
    role: 'Emphasis',
    sizeKey: appIconUsageTokens.emphasis,
  },
];

const categorizedIcons: IconGridItem[] = [
  { category: 'Navigation', icon: IconHome2, label: 'Home' },
  { category: 'Navigation', icon: IconListCheck, label: 'Buffer' },
  { category: 'Navigation', icon: IconSettings, label: 'Settings' },
  { category: 'Scanner', icon: IconQrcode, label: 'Scanner' },
  { category: 'Inventory', icon: IconPackage, label: 'Stock' },
  { category: 'Inventory', icon: IconTruckDelivery, label: 'Arrival' },
  { category: 'Inventory', icon: IconArrowBarToDown, label: 'Departure' },
  { category: 'Actions', icon: IconSearch, label: 'Search' },
  { category: 'Actions', icon: IconCopy, label: 'Copy' },
  { category: 'Actions', icon: IconDeviceFloppy, label: 'Save' },
  { category: 'Status', icon: IconCheck, label: 'Success' },
  { category: 'Status', icon: IconAlertTriangle, label: 'Warning' },
  { category: 'Status', icon: IconInfoCircle, label: 'Info' },
  { category: 'Structure', icon: IconArchive, label: 'Archive' },
];

function GuidanceCard(): ReactElement {
  return (
    <PageSection
      description="Один pack и один stroke contract важнее, чем набор случайных иконок из разных библиотек."
      title="1. Canonical decision"
    >
      <Stack gap="sm">
        <Group align="center" gap="sm">
          <Badge color="brandBlue" variant="light">
            {appIconPack}
          </Badge>
          <Text c="dimmed" size="sm">
            stroke {appIconStrokeWidth}
          </Text>
        </Group>
        {appIconographyGuidance.map((item) => (
          <Text key={item} size="sm">
            {item}
          </Text>
        ))}
      </Stack>
    </PageSection>
  );
}

function SizeGuidanceCard(): ReactElement {
  return (
    <PageSection
      description="Размеры иконок фиксируются по role-based guidance, а не выбираются случайно в каждом owner."
      title="2. Size guidance"
    >
      <Table withColumnBorders withRowBorders={false}>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Role</Table.Th>
            <Table.Th>Size</Table.Th>
            <Table.Th>Preview</Table.Th>
            <Table.Th>Usage</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {sizeGuidanceRows.map((item) => (
            <Table.Tr key={item.role}>
              <Table.Td>
                <Text fw={600} size="sm">
                  {item.role}
                </Text>
              </Table.Td>
              <Table.Td>
                <Text ff="monospace" size="sm">
                  {item.sizeKey} / {appIconSizeTokens[item.sizeKey]}px
                </Text>
              </Table.Td>
              <Table.Td>
                <ThemeIcon
                  color="brandBlue"
                  radius="xl"
                  size="lg"
                  variant="light"
                >
                  <IconInfoCircle
                    {...getAppIconProps(item.sizeKey)}
                    data-testid={`g-size-${item.role.toLowerCase().replaceAll(' / ', '-').replaceAll(' ', '-')}`}
                  />
                </ThemeIcon>
              </Table.Td>
              <Table.Td>
                <Text c="dimmed" size="sm">
                  {item.description}
                </Text>
              </Table.Td>
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>
    </PageSection>
  );
}

function ActionExamplesCard(): ReactElement {
  return (
    <PageSection
      description="ActionIcon и Button sections должны использовать один color-inherit icon contract."
      title="3. Action icon examples"
    >
      <Stack gap="md">
        <Group gap="sm" wrap="wrap">
          <ActionIcon
            aria-label="Search action"
            data-testid="g-action-search"
            size="sm"
            variant="light"
          >
            <IconSearch
              {...getAppIconProps(appIconUsageTokens.actionCompact)}
            />
          </ActionIcon>
          <ActionIcon
            aria-label="Scanner action"
            data-testid="g-action-scanner"
            size="lg"
            variant="filled"
          >
            <IconQrcode {...getAppIconProps(appIconUsageTokens.actionTouch)} />
          </ActionIcon>
          <ActionIcon
            aria-label="Settings action"
            data-testid="g-action-settings"
            size="lg"
            variant="outline"
          >
            <IconSettings
              {...getAppIconProps(appIconUsageTokens.actionTouch)}
            />
          </ActionIcon>
          <ActionIcon
            aria-label="Info action"
            data-testid="g-action-info"
            size="md"
            variant="subtle"
          >
            <IconInfoCircle {...getAppIconProps(appIconUsageTokens.helper)} />
          </ActionIcon>
        </Group>
        <Text c="dimmed" size="sm">
          Icon color stays inherited from the parent control. No per-icon fill
          overrides.
        </Text>
      </Stack>
    </PageSection>
  );
}

function NavigationExamplesCard(): ReactElement {
  const navItems = [
    { icon: IconHome2, label: 'Главная' },
    { icon: IconListCheck, label: 'Буфер' },
    { icon: IconQrcode, label: 'Сканер' },
    { icon: IconSettings, label: 'Настройки' },
  ] as const;

  return (
    <PageSection
      description="Навигационные иконки должны быть читаемыми в compact mobile-first shell без отдельного визуального языка."
      title="4. Navigation examples"
    >
      <SimpleGrid cols={{ base: 2, sm: 4 }} spacing="sm">
        {navItems.map((item, index) => {
          const Icon = item.icon;
          const selected = index === 1;

          return (
            <Paper
              data-testid={`g-nav-${index}`}
              key={item.label}
              p="sm"
              radius="lg"
              style={{
                background: selected
                  ? 'var(--sl-accent-soft)'
                  : 'var(--sl-surface-card)',
                border: selected
                  ? '1px solid var(--sl-accent)'
                  : '1px solid var(--sl-shell-border)',
              }}
              withBorder
            >
              <Stack align="center" gap="xs">
                <ThemeIcon
                  color={selected ? 'brandBlue' : 'gray'}
                  radius="xl"
                  size="lg"
                  variant={selected ? 'filled' : 'light'}
                >
                  <Icon
                    {...getAppIconProps(appIconUsageTokens.navigation)}
                    data-testid={`g-nav-icon-${index}`}
                  />
                </ThemeIcon>
                <Text fw={selected ? 700 : 600} size="xs">
                  {item.label}
                </Text>
              </Stack>
            </Paper>
          );
        })}
      </SimpleGrid>
    </PageSection>
  );
}

function CategorizedGridCard(): ReactElement {
  return (
    <PageSection
      description="UI kit показывает не полный pack, а рекомендуемый набор ролей и категорий для текущего продукта."
      title="5. Categorized icon grid"
    >
      <SimpleGrid cols={{ base: 2, sm: 3, lg: 4 }} spacing="md">
        {categorizedIcons.map((item) => {
          const Icon = item.icon;

          return (
            <Paper
              data-testid={`g-grid-${item.label.toLowerCase()}`}
              key={`${item.category}-${item.label}`}
              p="sm"
              radius="lg"
              shadow="sm"
              withBorder
            >
              <Stack align="center" gap="xs">
                <ThemeIcon
                  color="brandBlue"
                  radius="xl"
                  size="xl"
                  variant="light"
                >
                  <Icon {...getAppIconProps(appIconUsageTokens.navigation)} />
                </ThemeIcon>
                <Stack align="center" gap={2}>
                  <Title order={4} size="h6">
                    {item.label}
                  </Title>
                  <Text c="dimmed" size="xs">
                    {item.category}
                  </Text>
                </Stack>
              </Stack>
            </Paper>
          );
        })}
      </SimpleGrid>
    </PageSection>
  );
}

export function UiKitGIconographyContent(): ReactElement {
  return (
    <Stack gap="md">
      <SimpleGrid cols={{ base: 1, xl: 2 }} spacing="md">
        <GuidanceCard />
        <SizeGuidanceCard />
      </SimpleGrid>

      <SimpleGrid cols={{ base: 1, xl: 2 }} spacing="md">
        <ActionExamplesCard />
        <NavigationExamplesCard />
      </SimpleGrid>

      <CategorizedGridCard />
    </Stack>
  );
}
