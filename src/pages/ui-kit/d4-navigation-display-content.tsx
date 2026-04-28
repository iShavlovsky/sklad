import type { ReactElement } from 'react';
import { useState } from 'react';
import {
  Avatar,
  Badge,
  Burger,
  Button,
  Code,
  Divider,
  Group,
  Indicator,
  List,
  Mark,
  Pagination,
  Paper,
  Popover,
  Progress,
  RingProgress,
  SimpleGrid,
  Stack,
  Stepper,
  Table,
  Text,
  TextInput,
  ThemeIcon,
  Timeline,
} from '@mantine/core';
import {
  useDisclosure,
  useFocusWithin,
  useHover,
  useInterval,
  useReducedMotion,
} from '@mantine/hooks';
import {
  IconArrowDown,
  IconArrowUp,
  IconBox,
  IconCheck,
  IconCircleCheck,
  IconCircleDashed,
  IconClockHour4,
  IconFocus2,
  IconHandClick,
  IconHome,
  IconPackage,
  IconPlayerPause,
  IconPlayerPlay,
  IconScan,
} from '@tabler/icons-react';

import {
  BottomNavigation,
  type BottomNavigationItemConfig,
} from '@/features/navigation/ui/mobile-bottom-nav';
import { PageSection } from '@/shared/ui/page-section';

const bottomNavigationBaseItems: BottomNavigationItemConfig[] = [
  {
    ariaLabel: 'Главная',
    icon: IconHome,
    id: 'home',
    label: 'Главная',
  },
  {
    ariaLabel: 'Приход',
    icon: IconArrowDown,
    id: 'arrivals',
    label: 'Приход',
  },
  {
    ariaLabel: 'Отгрузка',
    icon: IconArrowUp,
    id: 'departures',
    label: 'Отгрузка',
  },
  {
    ariaLabel: 'Остатки',
    icon: IconBox,
    id: 'stocks',
    label: 'Остатки',
  },
] as const;

function BottomNavigationDemoFrame({
  children,
  testId,
}: Readonly<{
  children: ReactElement;
  testId?: string;
}>): ReactElement {
  return (
    <Paper
      data-testid={testId}
      p="md"
      radius="lg"
      style={{
        background:
          'linear-gradient(180deg, color-mix(in srgb, var(--sl-surface-card) 94%, white 6%), var(--sl-surface-raised))',
      }}
      withBorder
    >
      {children}
    </Paper>
  );
}

function BottomNavigationPreviewCard(): ReactElement {
  return (
    <PageSection
      description="Custom bottom navigation dock: not SegmentedControl semantics, but a route-navigation primitive with floating glass chrome and an active inner pill."
      title="6. Bottom navigation dock"
    >
      <Stack gap="md">
        <BottomNavigationDemoFrame testId="d4-bottom-nav-preview">
          <Stack gap="lg">
            <Stack gap="0.125rem">
              <Text fw={700} size="sm">
                Enlarged preview
              </Text>
              <Text c="dimmed" size="sm">
                Four route-aware destinations inside one floating glass dock.
              </Text>
            </Stack>
            <BottomNavigation
              ariaLabel="Bottom navigation demo"
              items={bottomNavigationBaseItems}
              value="home"
            />
          </Stack>
        </BottomNavigationDemoFrame>
      </Stack>
    </PageSection>
  );
}

function BottomNavigationStatesCard(): ReactElement {
  const stateSets: Array<{
    focusVisibleId?: string;
    items: BottomNavigationItemConfig[];
    pressedId?: string;
    testId: string;
    title: string;
    value: string;
  }> = [
    {
      items: bottomNavigationBaseItems,
      testId: 'd4-bottom-nav-state-active',
      title: 'Active',
      value: 'home',
    },
    {
      items: bottomNavigationBaseItems.map((item, index) =>
        index === 1 ? { ...item, indicator: true } : item
      ),
      testId: 'd4-bottom-nav-state-indicator',
      title: 'Indicator',
      value: 'home',
    },
    {
      items: bottomNavigationBaseItems,
      pressedId: 'departures',
      testId: 'd4-bottom-nav-state-pressed',
      title: 'Pressed',
      value: 'home',
    },
    {
      focusVisibleId: 'stocks',
      items: bottomNavigationBaseItems,
      testId: 'd4-bottom-nav-state-focus',
      title: 'Focus visible',
      value: 'home',
    },
    {
      items: bottomNavigationBaseItems.map((item, index) =>
        index === 0 ? { ...item, disabled: true } : item
      ),
      testId: 'd4-bottom-nav-state-disabled',
      title: 'Disabled',
      value: 'arrivals',
    },
  ];

  return (
    <PageSection
      description="State row covers active, indicator, pressed, focus-visible, and disabled without switching the primitive into form control semantics."
      title="7. Bottom nav states"
    >
      <SimpleGrid cols={{ base: 1, xl: 2 }} spacing="md">
        {stateSets.map((stateSet) => (
          <BottomNavigationDemoFrame
            key={stateSet.testId}
            testId={stateSet.testId}
          >
            <Stack gap="sm">
              <Text fw={700} size="sm">
                {stateSet.title}
              </Text>
              <BottomNavigation
                ariaLabel={`${stateSet.title} bottom navigation state`}
                focusVisibleId={stateSet.focusVisibleId}
                items={stateSet.items}
                pressedId={stateSet.pressedId}
                value={stateSet.value}
              />
            </Stack>
          </BottomNavigationDemoFrame>
        ))}
      </SimpleGrid>
    </PageSection>
  );
}

function BottomNavigationContextCard(): ReactElement {
  return (
    <PageSection
      description="Context preview keeps the dock inside a realistic shell-like composition with compact content above it."
      title="8. Bottom nav in app context"
    >
      <BottomNavigationDemoFrame testId="d4-bottom-nav-context">
        <Stack gap="md">
          <Paper p="sm" radius="md" withBorder>
            <Stack gap="0.25rem">
              <Group justify="space-between" wrap="nowrap">
                <Text fw={700} size="sm">
                  Последние операции
                </Text>
                <Button size="xxs" variant="subtle">
                  См. все
                </Button>
              </Group>
              <Stack gap="xs">
                <Paper p="xs" radius="md" withBorder>
                  <Group justify="space-between" wrap="nowrap">
                    <Text size="sm">Приход, Поставщик №15</Text>
                    <Text
                      fw={700}
                      size="sm"
                      style={{ color: 'var(--sl-app-success)' }}
                    >
                      8 900 ₽
                    </Text>
                  </Group>
                </Paper>
                <Paper p="xs" radius="md" withBorder>
                  <Group justify="space-between" wrap="nowrap">
                    <Text size="sm">Отгрузка, Розница №23</Text>
                    <Text fw={700} size="sm">
                      2 600 ₽
                    </Text>
                  </Group>
                </Paper>
              </Stack>
            </Stack>
          </Paper>
          <BottomNavigation
            ariaLabel="Bottom navigation context preview"
            items={bottomNavigationBaseItems}
            value="home"
          />
        </Stack>
      </BottomNavigationDemoFrame>
    </PageSection>
  );
}

function NavigationCard(): ReactElement {
  const [burgerOpened, setBurgerOpened] = useState(false);
  const [pageValue, setPageValue] = useState(4);
  const [activeStep, setActiveStep] = useState(1);

  return (
    <PageSection
      description="Burger, Pagination, and Stepper cover compact navigation and multistep guidance primitives."
      title="1. Navigation and step flow"
    >
      <Stack gap="md">
        <Group align="end" gap="lg" wrap="wrap">
          <Stack align="center" gap="xs">
            <Burger
              aria-label="Compact burger"
              data-testid="d4-burger-sm"
              onClick={() => setBurgerOpened((value) => !value)}
              opened={burgerOpened}
              size="sm"
            />
            <Text c="dimmed" size="xs">
              Burger sm
            </Text>
          </Stack>
          <Stack align="center" gap="xs">
            <Burger
              aria-label="Large burger"
              color={burgerOpened ? 'success' : 'brand'}
              data-testid="d4-burger-lg"
              onClick={() => setBurgerOpened((value) => !value)}
              opened={burgerOpened}
              size="lg"
            />
            <Text c="dimmed" size="xs">
              Burger lg
            </Text>
          </Stack>
        </Group>

        <Paper data-testid="d4-burger-panel" p="sm" withBorder>
          <Text c="dimmed" size="sm">
            Menu state:{' '}
            <Text component="span" fw={700} inherit>
              {burgerOpened ? 'opened' : 'closed'}
            </Text>
          </Text>
        </Paper>

        <Pagination
          data-testid="d4-pagination"
          onChange={setPageValue}
          total={12}
          value={pageValue}
          withEdges
        />

        <Group gap="sm">
          <Button
            data-testid="d4-pagination-prev"
            disabled={pageValue === 1}
            onClick={() => setPageValue((value) => Math.max(1, value - 1))}
            size="xs"
            variant="default"
          >
            Previous page
          </Button>
          <Button
            data-testid="d4-pagination-next"
            disabled={pageValue === 12}
            onClick={() => setPageValue((value) => Math.min(12, value + 1))}
            size="xs"
            variant="default"
          >
            Next page
          </Button>
        </Group>

        <Text c="dimmed" data-testid="d4-pagination-state" size="sm">
          Current page: {pageValue}
        </Text>

        <Stepper
          active={activeStep}
          data-testid="d4-stepper"
          onStepClick={setActiveStep}
          size="sm"
        >
          <Stepper.Step
            description="Сканирование"
            icon={<IconScan size={16} />}
            label="Сканер"
          />
          <Stepper.Step
            description="Проверка"
            icon={<IconPackage size={16} />}
            label="Буфер"
          />
          <Stepper.Step
            description="Сохранение"
            icon={<IconCheck size={16} />}
            label="Форма"
          />
        </Stepper>

        <Text c="dimmed" data-testid="d4-stepper-state" size="sm">
          Current step: {activeStep + 1}
        </Text>

        <Group gap="sm">
          <Button
            data-testid="d4-stepper-prev"
            disabled={activeStep === 0}
            onClick={() => setActiveStep((value) => Math.max(0, value - 1))}
            size="xs"
            variant="default"
          >
            Previous
          </Button>
          <Button
            data-testid="d4-stepper-next"
            disabled={activeStep === 2}
            onClick={() => setActiveStep((value) => Math.min(2, value + 1))}
            size="xs"
          >
            Next
          </Button>
        </Group>
      </Stack>
    </PageSection>
  );
}

function ProgressCard(): ReactElement {
  const [progressValue, setProgressValue] = useState(36);
  const [ringValue, setRingValue] = useState(72);
  const [indicatorCount, setIndicatorCount] = useState(3);
  const progressInterval = useInterval(
    () => {
      setProgressValue((value) => (value >= 92 ? 18 : value + 6));
      setRingValue((value) => (value >= 88 ? 24 : value + 4));
      setIndicatorCount((value) => (value >= 9 ? 1 : value + 1));
    },
    1200,
    { autoInvoke: true }
  );

  return (
    <PageSection
      description="Progress, RingProgress, and Indicator provide compact completion and status signals."
      title="2. Progress and status"
    >
      <Stack gap="md">
        <Stack gap="xs">
          <Text fw={700} size="sm">
            Progress scale
          </Text>
          <Progress
            data-testid="d4-progress-sm"
            size="sm"
            value={Math.max(12, progressValue - 20)}
          />
          <Progress
            animated
            color="success"
            data-testid="d4-progress-lg"
            size="lg"
            striped
            value={progressValue}
          />
          <Text c="dimmed" data-testid="d4-progress-state" size="sm">
            Active value: {progressValue}%
          </Text>
          <Group gap="sm">
            <Button
              data-testid="d4-progress-toggle"
              leftSection={
                progressInterval.active ? (
                  <IconPlayerPause size={14} />
                ) : (
                  <IconPlayerPlay size={14} />
                )
              }
              onClick={progressInterval.toggle}
              size="xs"
              variant="default"
            >
              {progressInterval.active ? 'Pause motion' : 'Resume motion'}
            </Button>
            <Badge
              color={progressInterval.active ? 'success' : 'warning'}
              size="sm"
              variant="light"
            >
              {progressInterval.active ? 'Interval active' : 'Interval paused'}
            </Badge>
          </Group>
        </Stack>

        <Group align="center" gap="xl" wrap="wrap">
          <RingProgress
            data-testid="d4-ring-progress"
            label={
              <Stack align="center" gap="0.125rem">
                <Text fw={700}>{ringValue}%</Text>
                <Text c="dimmed" size="xs">
                  Live
                </Text>
              </Stack>
            }
            sections={[
              { color: 'success', value: Math.max(12, ringValue - 24) },
              { color: 'brand', value: 24 },
            ]}
            size={132}
          />

          <Indicator
            color="error"
            data-testid="d4-indicator"
            label={indicatorCount}
            processing
            size={18}
          >
            <Avatar color="brand" radius="xl" size="lg" variant="light">
              IS
            </Avatar>
          </Indicator>
        </Group>
      </Stack>
    </PageSection>
  );
}

function HooksIntegrationCard(): ReactElement {
  const { hovered, ref: hoverRef } = useHover<HTMLDivElement>();
  const { focused, ref: focusRef } = useFocusWithin<HTMLDivElement>();
  const [popoverOpened, popoverHandlers] = useDisclosure(false);
  const reduceMotion = useReducedMotion();
  const [motionRunning, motionHandlers] = useDisclosure(!reduceMotion);
  const [hookProgress, setHookProgress] = useState(28);
  const hooksInterval = useInterval(
    () => {
      setHookProgress((value) => (value >= 94 ? 22 : value + 8));
    },
    1000,
    {
      autoInvoke: !reduceMotion,
    }
  );

  const motionIsLive = motionRunning;

  return (
    <PageSection
      description="Mantine hooks should work with Mantine primitives directly: control state, focus, hover, and motion without custom wrapper systems."
      title="5. Hooks + components"
    >
      <Stack gap="md">
        <Group gap="sm" wrap="wrap">
          <Badge
            data-testid="d4-hooks-reduced-motion"
            color={reduceMotion ? 'warning' : 'success'}
            variant="light"
          >
            {reduceMotion
              ? 'Reduced motion detected'
              : 'Normal motion detected'}
          </Badge>
          <Button
            data-testid="d4-hooks-motion-toggle"
            leftSection={
              motionIsLive ? (
                <IconPlayerPause size={14} />
              ) : (
                <IconPlayerPlay size={14} />
              )
            }
            onClick={() => {
              motionHandlers.toggle();

              if (motionIsLive) {
                hooksInterval.stop();
              } else {
                hooksInterval.start();
              }
            }}
            size="xs"
            variant="default"
          >
            {motionIsLive ? 'Pause preview motion' : 'Enable preview motion'}
          </Button>
          <Badge color={motionIsLive ? 'info' : 'neutralSlate'} variant="light">
            {motionIsLive ? 'Motion preview active' : 'Motion preview paused'}
          </Badge>
        </Group>

        <SimpleGrid cols={{ base: 1, lg: 2 }} spacing="md">
          <Paper
            data-interactive="true"
            data-testid="d4-hook-hover-card"
            p="md"
            ref={hoverRef}
            style={{
              background: hovered
                ? 'var(--sl-nav-active-background)'
                : undefined,
            }}
            withBorder
          >
            <Stack gap="xs">
              <Group justify="space-between">
                <Text fw={700} size="sm">
                  useHover + Paper
                </Text>
                <ThemeIcon
                  color={hovered ? 'success' : 'brand'}
                  radius="xl"
                  size="sm"
                  variant="light"
                >
                  <IconHandClick size={14} />
                </ThemeIcon>
              </Group>
              <Text c="dimmed" size="sm">
                Hover surface state: {hovered ? 'hovered' : 'idle'}
              </Text>
              <Code>const {'{ hovered, ref }'} = useHover()</Code>
            </Stack>
          </Paper>

          <Paper
            data-interactive="true"
            data-testid="d4-hook-focus-card"
            p="md"
            ref={focusRef}
            style={{
              background: focused ? 'var(--sl-accent-soft)' : undefined,
            }}
            withBorder
          >
            <Stack gap="sm">
              <Group justify="space-between">
                <Text fw={700} size="sm">
                  useFocusWithin + inputs
                </Text>
                <ThemeIcon
                  color={focused ? 'success' : 'brand'}
                  radius="xl"
                  size="sm"
                  variant="light"
                >
                  <IconFocus2 size={14} />
                </ThemeIcon>
              </Group>
              <Text c="dimmed" size="sm">
                Focus state: {focused ? 'focused within' : 'idle'}
              </Text>
              <TextInput
                data-testid="d4-hook-focus-input"
                label="Hook-aware input"
                placeholder="Focus this field"
                size="sm"
              />
              <Button size="xs" variant="default">
                Secondary action
              </Button>
            </Stack>
          </Paper>
        </SimpleGrid>

        <Divider />

        <SimpleGrid cols={{ base: 1, lg: 2 }} spacing="md">
          <Popover
            onChange={popoverHandlers.set}
            opened={popoverOpened}
            position="bottom-start"
            trapFocus
            width="clamp(13rem, 54vw, 17.5rem)"
            withinPortal={false}
          >
            <Popover.Target>
              <Button
                data-testid="d4-hooks-popover-toggle"
                onClick={popoverHandlers.toggle}
                variant="default"
              >
                useDisclosure popover
              </Button>
            </Popover.Target>
            <Popover.Dropdown data-testid="d4-hooks-popover">
              <Stack gap="xs">
                <Text fw={700} size="sm">
                  useDisclosure
                </Text>
                <Text c="dimmed" size="sm">
                  Hook-controlled popover state keeps Mantine overlay behavior
                  explicit and local.
                </Text>
                <Button onClick={popoverHandlers.close} size="xs">
                  Close
                </Button>
              </Stack>
            </Popover.Dropdown>
          </Popover>

          <Paper
            data-interactive="true"
            data-testid="d4-hooks-motion-card"
            p="md"
            withBorder
          >
            <Stack gap="sm">
              <Text fw={700} size="sm">
                useInterval + useReducedMotion
              </Text>
              <Text c="dimmed" size="sm">
                Hooks drive live progress while keeping reduced-motion
                preference visible on the proof surface.
              </Text>
              <Progress
                animated={motionIsLive}
                color={motionIsLive ? 'brand' : 'neutralSlate'}
                data-testid="d4-hooks-motion-progress"
                size="lg"
                striped={motionIsLive}
                value={hookProgress}
              />
              <Text c="dimmed" data-testid="d4-hooks-motion-state" size="sm">
                Hook progress: {hookProgress}%
              </Text>
            </Stack>
          </Paper>
        </SimpleGrid>
      </Stack>
    </PageSection>
  );
}

function IdentityAndContentCard(): ReactElement {
  const [highlighted, setHighlighted] = useState(true);

  return (
    <PageSection
      description="Avatar, Timeline, List, Mark, and Text keep lightweight identity and reading patterns inside the same visual language."
      title="3. Identity and content"
    >
      <Stack gap="md">
        <Group data-testid="d4-avatar-group" gap="sm">
          <Avatar size="sm">IS</Avatar>
          <Avatar color="success" size="md">
            SK
          </Avatar>
          <Avatar color="warning" size="lg">
            UX
          </Avatar>
          <Badge size="xs">Owner set</Badge>
        </Group>

        <Timeline
          active={1}
          bulletSize={24}
          data-testid="d4-timeline"
          lineWidth={2}
        >
          <Timeline.Item
            bullet={<IconCircleCheck size={12} />}
            title="Снимок создан"
          >
            <Text c="dimmed" size="sm">
              Данные собраны и готовы к локальной проверке.
            </Text>
          </Timeline.Item>
          <Timeline.Item
            bullet={<IconClockHour4 size={12} />}
            title="Проверка в процессе"
          >
            <Text c="dimmed" size="sm">
              Пользователь проверяет итоговые значения перед записью.
            </Text>
          </Timeline.Item>
          <Timeline.Item
            bullet={<IconCircleDashed size={12} />}
            title="Готово к сохранению"
          >
            <Text c="dimmed" size="sm">
              Следующий шаг подтверждает изменение в журнале.
            </Text>
          </Timeline.Item>
        </Timeline>

        <SimpleGrid cols={{ base: 1, md: 2 }} spacing="md">
          <Paper p="md" withBorder>
            <Stack gap="xs">
              <Text fw={700} size="sm">
                Mark and Text
              </Text>
              <Text data-testid="d4-mark-text" size="sm">
                Проверка помогает быстро увидеть{' '}
                {highlighted ? (
                  <Mark>критические отличия</Mark>
                ) : (
                  'критические отличия'
                )}{' '}
                в плотных интерфейсах.
              </Text>
              <Button
                data-testid="d4-toggle-mark"
                onClick={() => setHighlighted((value) => !value)}
                size="xs"
                variant="default"
              >
                Toggle mark
              </Button>
            </Stack>
          </Paper>

          <Paper p="md" withBorder>
            <Stack gap="xs">
              <Text fw={700} size="sm">
                List
              </Text>
              <List
                data-testid="d4-list"
                icon={
                  <ThemeIcon
                    color="brand"
                    radius="xl"
                    size={18}
                    variant="light"
                  >
                    <IconCheck size={12} />
                  </ThemeIcon>
                }
              >
                <List.Item>Короткие системные правила.</List.Item>
                <List.Item>Чек-листы подтверждения.</List.Item>
                <List.Item>Плотные служебные заметки.</List.Item>
              </List>
            </Stack>
          </Paper>
        </SimpleGrid>
      </Stack>
    </PageSection>
  );
}

function DataCard(): ReactElement {
  return (
    <PageSection
      description="Table remains compact, readable, and numeric-friendly for dense operational views."
      title="4. Data display"
    >
      <Table.ScrollContainer minWidth="32.5rem">
        <Table
          data-testid="d4-table"
          data={{
            body: [
              ['INV-1042', 'Приход', '12', 'Готово'],
              ['INV-1043', 'Отгрузка', '4', 'Проверка'],
              ['INV-1044', 'Черновик', '7', 'Ожидает'],
            ],
            head: ['Документ', 'Тип', 'Количество', 'Статус'],
          }}
        />
      </Table.ScrollContainer>
    </PageSection>
  );
}

export function UiKitD4NavigationDisplayContent(): ReactElement {
  return (
    <Stack gap="md">
      <SimpleGrid cols={{ base: 1, xl: 2 }} spacing="md">
        <NavigationCard />
        <ProgressCard />
      </SimpleGrid>

      <SimpleGrid cols={{ base: 1, xl: 2 }} spacing="md">
        <IdentityAndContentCard />
        <DataCard />
      </SimpleGrid>

      <SimpleGrid cols={{ base: 1, xl: 2 }} spacing="md">
        <BottomNavigationPreviewCard />
        <BottomNavigationContextCard />
      </SimpleGrid>

      <BottomNavigationStatesCard />
      <HooksIntegrationCard />
    </Stack>
  );
}
