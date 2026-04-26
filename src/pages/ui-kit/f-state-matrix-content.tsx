import type { CSSProperties, ReactElement, ReactNode } from 'react';
import {
  Alert,
  Badge,
  Button,
  Group,
  Loader,
  Notification,
  Paper,
  SegmentedControl,
  SimpleGrid,
  Skeleton,
  Stack,
  Tabs,
  Text,
  TextInput,
  ThemeIcon,
} from '@mantine/core';
import {
  IconAlertTriangle,
  IconCheck,
  IconCloudOff,
  IconInfoCircle,
  IconListCheck,
  IconWifi,
} from '@tabler/icons-react';

import { themeModeConfigs } from '@/app/theme/tokens';
import { PageSection } from '@/shared/ui/page-section';

type StatusBadgeTone = {
  color: string;
  label: string;
  token: string;
};

type DemoRowState = 'default' | 'hover' | 'selected' | 'disabled';

const lightTokens = themeModeConfigs.light.other;
const darkTokens = themeModeConfigs.dark.other;

const syncStatusBadges: StatusBadgeTone[] = [
  {
    color: lightTokens.sync.offline,
    label: 'Offline',
    token: 'sync.offline',
  },
  {
    color: lightTokens.sync.pending,
    label: 'Pending',
    token: 'sync.pending',
  },
  {
    color: lightTokens.sync.synced,
    label: 'Synced',
    token: 'sync.synced',
  },
  {
    color: lightTokens.intent.success,
    label: 'Success',
    token: 'intent.success',
  },
  {
    color: lightTokens.intent.error,
    label: 'Error',
    token: 'intent.error',
  },
  {
    color: lightTokens.intent.info,
    label: 'Info',
    token: 'intent.info',
  },
];

function toneSurface(
  color: string,
  mix = 12,
  base = 'var(--sl-surface-card)'
): string {
  return `color-mix(in srgb, ${color} ${mix}%, ${base})`;
}

function toneBorder(
  color: string,
  mix = 38,
  base = 'var(--sl-shell-border)'
): string {
  return `color-mix(in srgb, ${color} ${mix}%, ${base})`;
}

function toneFocus(color: string, mix = 18): string {
  return `0 0 0 var(--sl-focus-width) color-mix(in srgb, ${color} ${mix}%, transparent)`;
}

function statusBadgeStyles(color: string): { root: CSSProperties } {
  return {
    root: {
      backgroundColor: toneSurface(color, 14),
      borderColor: toneBorder(color, 42),
      color,
    },
  };
}

function darkStatusBadgeStyles(color: string): { root: CSSProperties } {
  return {
    root: {
      backgroundColor: `color-mix(in srgb, ${color} 18%, ${darkTokens.surface.paper})`,
      borderColor: `color-mix(in srgb, ${color} 40%, ${darkTokens.border.default})`,
      color: '#f8fafc',
    },
  };
}

function inputToneStyles(color: string): {
  input: CSSProperties;
  section: CSSProperties;
} {
  return {
    input: {
      backgroundColor: toneSurface(color, 10, 'var(--sl-surface-input)'),
      borderColor: color,
      boxShadow: 'none',
    },
    section: {
      color,
    },
  };
}

function listRowStyle(state: DemoRowState): CSSProperties {
  if (state === 'selected') {
    return {
      backgroundColor: toneSurface(lightTokens.intent.primary, 12),
      border: `1px solid ${toneBorder(lightTokens.intent.primary, 44)}`,
      boxShadow: 'var(--sl-control-shadow)',
      color: 'var(--sl-text)',
    };
  }

  if (state === 'hover') {
    return {
      backgroundColor: toneSurface(lightTokens.intent.primary, 7),
      border: `1px solid ${toneBorder(lightTokens.intent.primary, 28)}`,
      color: 'var(--sl-text)',
      transform: 'translateY(-1px)',
    };
  }

  if (state === 'disabled') {
    return {
      backgroundColor: 'var(--sl-surface-subtle)',
      border: '1px solid var(--sl-shell-border)',
      color: 'var(--sl-muted-text)',
      opacity: 0.78,
    };
  }

  return {
    backgroundColor: 'var(--sl-surface-card)',
    border: '1px solid var(--sl-shell-border)',
    color: 'var(--sl-text)',
  };
}

function DemoRow({
  description,
  state,
  testId,
  title,
}: Readonly<{
  description: string;
  state: DemoRowState;
  testId: string;
  title: string;
}>): ReactElement {
  return (
    <Paper
      data-interactive="true"
      data-preview-state={state}
      data-testid={testId}
      p="sm"
      radius="md"
      style={listRowStyle(state)}
    >
      <Group justify="space-between" wrap="nowrap">
        <Group gap="sm" wrap="nowrap">
          <ThemeIcon
            color={
              state === 'selected'
                ? 'brandBlue'
                : state === 'disabled'
                  ? 'gray'
                  : 'blue'
            }
            radius="xl"
            size="sm"
            variant={state === 'selected' ? 'filled' : 'light'}
          >
            <IconListCheck size={14} />
          </ThemeIcon>
          <Stack gap={2}>
            <Text fw={600} size="sm">
              {title}
            </Text>
            <Text c={state === 'disabled' ? 'dimmed' : undefined} size="xs">
              {description}
            </Text>
          </Stack>
        </Group>
        <Badge
          color={
            state === 'selected'
              ? 'brandBlue'
              : state === 'disabled'
                ? 'gray'
                : 'blue'
          }
          variant={state === 'selected' ? 'filled' : 'light'}
        >
          {state}
        </Badge>
      </Group>
    </Paper>
  );
}

function DarkPreviewCard({
  children,
  description,
  title,
}: Readonly<{
  children: ReactNode;
  description: string;
  title: string;
}>): ReactElement {
  return (
    <PageSection description={description} title={title}>
      <Paper
        p="md"
        radius="lg"
        style={{
          background: darkTokens.surface.background,
          border: `1px solid ${darkTokens.border.default}`,
          color: darkTokens.text.primary,
        }}
      >
        {children}
      </Paper>
    </PageSection>
  );
}

function ButtonStatesCard(): ReactElement {
  return (
    <PageSection
      description="Button states фиксируют не только variant, но и active, hover, focus, pending и disabled language."
      title="1. Button states"
    >
      <Stack gap="md">
        <SimpleGrid cols={{ base: 1, sm: 2, xl: 4 }} spacing="sm">
          <Button data-testid="f-button-default">Default</Button>
          <Button
            data-testid="f-button-hover"
            styles={{
              root: {
                backgroundColor: toneSurface(
                  lightTokens.intent.primary,
                  18,
                  'var(--sl-accent)'
                ),
                boxShadow: 'var(--sl-control-shadow)',
                transform: 'translateY(-1px)',
              },
            }}
          >
            Hover preview
          </Button>
          <Button
            data-testid="f-button-focus"
            styles={{
              root: {
                boxShadow: toneFocus(lightTokens.focus.ring),
              },
            }}
            variant="outline"
          >
            Focus preview
          </Button>
          <Button
            data-testid="f-button-active"
            styles={{
              root: {
                transform: 'translateY(1px) scale(0.995)',
              },
            }}
          >
            Active preview
          </Button>
          <Button color="green" data-testid="f-button-success">
            Success
          </Button>
          <Button color="red" data-testid="f-button-error" variant="outline">
            Error
          </Button>
          <Button
            data-testid="f-button-pending"
            leftSection={<Loader color="currentColor" size="xs" type="dots" />}
            loading
            loaderProps={{ type: 'dots' }}
            variant="light"
          >
            Pending
          </Button>
          <Button data-testid="f-button-disabled" disabled variant="default">
            Disabled
          </Button>
        </SimpleGrid>
      </Stack>
    </PageSection>
  );
}

function InputStatesCard(): ReactElement {
  return (
    <PageSection
      description="Input states используют один filled-input contract: neutral, success, warning, error, info, pending и disabled."
      title="2. Input states"
    >
      <Stack gap="sm">
        <TextInput
          data-testid="f-input-neutral"
          description="Нейтральное состояние."
          label="Neutral"
          placeholder="Введите значение"
        />
        <TextInput
          data-testid="f-input-success"
          defaultValue="SKU-2026-042"
          description="Подтверждено и готово к сохранению."
          label="Success"
          rightSection={<IconCheck size={16} />}
          styles={inputToneStyles(lightTokens.intent.success)}
        />
        <TextInput
          data-testid="f-input-warning"
          defaultValue="Needs review"
          description="Требуется ручная проверка."
          label="Warning"
          rightSection={<IconAlertTriangle size={16} />}
          styles={inputToneStyles(lightTokens.intent.warning)}
        />
        <TextInput
          data-testid="f-input-error"
          error="Проверьте формат кода"
          label="Error"
          placeholder="Некорректное значение"
          styles={inputToneStyles(lightTokens.intent.error)}
        />
        <TextInput
          data-testid="f-input-info"
          description="Подсказка и информационный тон без ошибки."
          label="Info / help"
          leftSection={<IconInfoCircle size={16} />}
          placeholder="Дополнительный контекст"
          styles={inputToneStyles(lightTokens.intent.info)}
        />
        <TextInput
          data-testid="f-input-pending"
          defaultValue="Uploading"
          description="Ожидает завершения операции."
          label="Pending"
          rightSection={<Loader color="currentColor" size="xs" type="dots" />}
          rightSectionWidth={36}
          styles={inputToneStyles(lightTokens.sync.pending)}
        />
        <TextInput
          data-testid="f-input-disabled"
          defaultValue="Недоступно"
          disabled
          label="Disabled"
        />
      </Stack>
    </PageSection>
  );
}

function ListRowStatesCard(): ReactElement {
  return (
    <PageSection
      description="List-row language показывает selection, hover-preview и disabled state без новой product-specific table/grid системы."
      title="3. List-row states"
    >
      <Stack gap="sm">
        <DemoRow
          description="Нейтральная строка без активного выбора."
          state="default"
          testId="f-row-default"
          title="Buffer row"
        />
        <DemoRow
          description="Легкий hover-preview для быстрой проверки target state."
          state="hover"
          testId="f-row-hover"
          title="Hovered row"
        />
        <DemoRow
          description="Выбранная строка с accent surface и повышенным приоритетом."
          state="selected"
          testId="f-row-selected"
          title="Selected row"
        />
        <DemoRow
          description="Недоступная строка не конкурирует за внимание."
          state="disabled"
          testId="f-row-disabled"
          title="Disabled row"
        />
      </Stack>
    </PageSection>
  );
}

function TabsAndSegmentsCard(): ReactElement {
  return (
    <PageSection
      description="Tabs и SegmentedControl должны читать active/selected/disabled states одинаково предсказуемо."
      title="4. Tabs and segmented states"
    >
      <Stack gap="md">
        <SegmentedControl
          data={[
            { label: 'Active', value: 'active' },
            { label: 'Pending', value: 'pending' },
            { label: 'Disabled', value: 'disabled', disabled: true },
          ]}
          data-testid="f-segmented"
          defaultValue="pending"
          readOnly
        />
        <Tabs data-testid="f-tabs" defaultValue="selected">
          <Tabs.List>
            <Tabs.Tab data-testid="f-tab-default" value="default">
              Default
            </Tabs.Tab>
            <Tabs.Tab data-testid="f-tab-selected" value="selected">
              Selected
            </Tabs.Tab>
            <Tabs.Tab data-testid="f-tab-disabled" disabled value="disabled">
              Disabled
            </Tabs.Tab>
          </Tabs.List>
          <Tabs.Panel pt="sm" value="selected">
            <Text c="dimmed" size="sm">
              Active state для route-adjacent tab surface.
            </Text>
          </Tabs.Panel>
        </Tabs>
      </Stack>
    </PageSection>
  );
}

function StatusBadgesCard(): ReactElement {
  return (
    <PageSection
      description="Semantic status badges закрепляют один статусный язык для sync, pending и result surfaces."
      title="5. Semantic status badges"
    >
      <Stack gap="md">
        <Group gap="sm" wrap="wrap">
          {syncStatusBadges.map((item) => (
            <Badge
              key={item.token}
              data-testid={`f-badge-${item.label.toLowerCase()}`}
              styles={statusBadgeStyles(item.color)}
              variant="light"
            >
              {item.label}
            </Badge>
          ))}
        </Group>
        <Text c="dimmed" ff="monospace" size="xs">
          sync.offline / sync.pending / sync.synced / intent.success /
          intent.error / intent.info
        </Text>
      </Stack>
    </PageSection>
  );
}

function FeedbackExamplesCard(): ReactElement {
  return (
    <PageSection
      description="Validation, help и status feedback используют один tonal contract на Alert и Notification."
      title="6. Help, validation, notification states"
    >
      <Stack gap="sm">
        <Alert
          color="blue"
          data-testid="f-help-alert"
          icon={<IconInfoCircle size={16} />}
          title="Info / help"
          variant="light"
        >
          Короткая подсказка для полей и статусов.
        </Alert>
        <Alert
          color="red"
          data-testid="f-validation-alert"
          icon={<IconAlertTriangle size={16} />}
          title="Validation"
          variant="light"
        >
          Ошибка должна быть видна не только по иконке, но и по surface.
        </Alert>
        <Notification
          color="green"
          data-testid="f-notification-success"
          icon={<IconCheck size={16} />}
          title="Success"
          withCloseButton={false}
        >
          Изменения сохранены локально.
        </Notification>
        <Notification
          color="blue"
          data-testid="f-notification-pending"
          loading
          title="Pending"
          withCloseButton={false}
        >
          Идёт локальная обработка данных.
        </Notification>
      </Stack>
    </PageSection>
  );
}

function EmptyLoadingCard(): ReactElement {
  return (
    <PageSection
      description="Empty и loading states повторяют уже принятый vocabulary: Loader для busy, Skeleton для placeholder, concise empty state для отсутствия данных."
      title="7. Empty and loading reuse"
    >
      <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="sm">
        <Paper
          data-testid="f-loading-card"
          p="md"
          radius="lg"
          shadow="sm"
          withBorder
        >
          <Stack align="center" gap="sm">
            <Loader data-testid="f-loader-inline" size="md" type="dots" />
            <Text c="dimmed" size="sm">
              Loading
            </Text>
          </Stack>
        </Paper>
        <Paper
          data-testid="f-skeleton-card"
          p="md"
          radius="lg"
          shadow="sm"
          withBorder
        >
          <Stack gap="xs">
            <Skeleton h={12} radius="xl" />
            <Skeleton h={12} radius="xl" w="72%" />
            <Skeleton h={12} radius="xl" w="52%" />
          </Stack>
        </Paper>
        <Paper
          data-testid="f-empty-card"
          p="md"
          radius="lg"
          shadow="sm"
          withBorder
        >
          <Stack align="center" gap="sm">
            <ThemeIcon color="gray" radius="xl" size="lg" variant="light">
              <IconCloudOff size={18} />
            </ThemeIcon>
            <Stack align="center" gap={2}>
              <Text fw={600} size="sm">
                Empty state
              </Text>
              <Text c="dimmed" size="xs">
                Нет записей для отображения.
              </Text>
            </Stack>
          </Stack>
        </Paper>
      </SimpleGrid>
    </PageSection>
  );
}

function DarkPreviewStrip(): ReactElement {
  return (
    <DarkPreviewCard
      description="Light/dark parity лучше проверять на том же proof surface, а не отдельным продуктовым экраном."
      title="8. Dark preview strip"
    >
      <Stack gap="sm">
        <Group gap="sm" wrap="wrap">
          {syncStatusBadges.map((item) => (
            <Badge
              key={`dark-${item.token}`}
              data-testid={`f-dark-badge-${item.label.toLowerCase()}`}
              styles={darkStatusBadgeStyles(item.color)}
              variant="light"
            >
              {item.label}
            </Badge>
          ))}
        </Group>
        <Group grow>
          <Button
            color="brandBlue"
            data-testid="f-dark-button"
            styles={{
              root: {
                backgroundColor: toneSurface(
                  darkTokens.intent.primary,
                  26,
                  darkTokens.surface.raised
                ),
                border: `1px solid ${toneBorder(darkTokens.intent.primary, 50, darkTokens.border.default)}`,
                color: darkTokens.text.primary,
              },
            }}
            variant="light"
          >
            Active dark
          </Button>
          <TextInput
            data-testid="f-dark-input"
            defaultValue="Buffered"
            label="Dark state"
            styles={{
              label: {
                color: darkTokens.text.primary,
              },
              description: {
                color: darkTokens.text.secondary,
              },
              input: {
                backgroundColor: darkTokens.surface.paper,
                borderColor: darkTokens.border.default,
                color: darkTokens.text.primary,
              },
            }}
          />
        </Group>
        <Paper
          data-testid="f-dark-row"
          p="sm"
          radius="md"
          style={{
            backgroundColor: toneSurface(
              darkTokens.intent.primary,
              16,
              darkTokens.surface.paper
            ),
            border: `1px solid ${toneBorder(darkTokens.intent.primary, 46, darkTokens.border.default)}`,
            color: darkTokens.text.primary,
          }}
        >
          <Group justify="space-between" wrap="nowrap">
            <Group gap="sm" wrap="nowrap">
              <ThemeIcon color="blue" radius="xl" size="sm" variant="filled">
                <IconWifi size={14} />
              </ThemeIcon>
              <Stack gap={2}>
                <Text size="sm">Selected dark row</Text>
                <Text c={darkTokens.text.secondary} size="xs">
                  Та же state language на dark surface.
                </Text>
              </Stack>
            </Group>
            <Badge styles={darkStatusBadgeStyles(darkTokens.sync.pending)}>
              Pending
            </Badge>
          </Group>
        </Paper>
      </Stack>
    </DarkPreviewCard>
  );
}

export function UiKitFStateMatrixContent(): ReactElement {
  return (
    <Stack gap="md">
      <SimpleGrid cols={{ base: 1, xl: 2 }} spacing="md">
        <ButtonStatesCard />
        <InputStatesCard />
      </SimpleGrid>

      <SimpleGrid cols={{ base: 1, xl: 2 }} spacing="md">
        <ListRowStatesCard />
        <TabsAndSegmentsCard />
      </SimpleGrid>

      <SimpleGrid cols={{ base: 1, xl: 2 }} spacing="md">
        <StatusBadgesCard />
        <FeedbackExamplesCard />
      </SimpleGrid>

      <EmptyLoadingCard />
      <DarkPreviewStrip />
    </Stack>
  );
}
