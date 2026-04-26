import {
  type CSSProperties,
  type ReactElement,
  useMemo,
  useState,
} from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Button,
  Code,
  Group,
  NumberInput,
  Paper,
  Select,
  Stack,
  Text,
  TextInput,
  Title,
} from '@mantine/core';

import { APP_ROUTES } from '@/shared/config/routes';

import styles from './styles.module.css';

type DevicePreset = {
  value: string;
  label: string;
  width: number;
  height: number;
  deviceScaleFactor: number;
};

type DevicePreviewControlsProps = {
  currentDpr: number;
  currentTarget: string;
  currentTargetOption: string | null;
  onApply: (
    nextTarget: string,
    nextPreset: DevicePreset,
    nextDpr: number
  ) => void;
  preset: DevicePreset;
};

const DEVICE_PRESETS = [
  {
    value: 'samsung-galaxy-s21-s24',
    label: 'Samsung Galaxy S21-S24',
    width: 360,
    height: 800,
    deviceScaleFactor: 3,
  },
  {
    value: 'samsung-galaxy-a54',
    label: 'Samsung Galaxy A54',
    width: 412,
    height: 915,
    deviceScaleFactor: 2.625,
  },
  {
    value: 'google-pixel-7-8',
    label: 'Google Pixel 7/8',
    width: 412,
    height: 915,
    deviceScaleFactor: 2.625,
  },
  {
    value: 'google-pixel-8-pro',
    label: 'Google Pixel 8 Pro',
    width: 448,
    height: 998,
    deviceScaleFactor: 2.625,
  },
  {
    value: 'oneplus-12',
    label: 'OnePlus 12',
    width: 412,
    height: 915,
    deviceScaleFactor: 3.5,
  },
  {
    value: 'xiaomi-14',
    label: 'Xiaomi 14',
    width: 393,
    height: 873,
    deviceScaleFactor: 3,
  },
  {
    value: 'iphone-14-pro',
    label: 'iPhone 14 Pro',
    width: 393,
    height: 852,
    deviceScaleFactor: 3,
  },
] as const satisfies readonly DevicePreset[];

const [DEFAULT_PRESET] = DEVICE_PRESETS;

const ROUTE_OPTIONS = [
  { value: APP_ROUTES.dashboard, label: 'Главная' },
  { value: APP_ROUTES.arrivals, label: 'Приходы' },
  { value: APP_ROUTES.arrivalsCreate, label: 'Новый приход' },
  { value: APP_ROUTES.departures, label: 'Расходы' },
  { value: APP_ROUTES.departuresCreate, label: 'Новый расход' },
  { value: APP_ROUTES.buffer, label: 'Буфер' },
  { value: APP_ROUTES.stocks, label: 'Остатки' },
  { value: APP_ROUTES.settings, label: 'Настройки' },
  { value: APP_ROUTES.settingsBackup, label: 'Резервные копии' },
  { value: APP_ROUTES.uiKit, label: 'UI Kit' },
] as const;

function normalizePreviewTarget(value: string | null): string {
  const rawValue = value?.trim() ?? '';

  if (rawValue.length === 0) {
    return APP_ROUTES.dashboard;
  }

  const withoutHash = rawValue.replace(/^#/, '');
  const normalizedPath = withoutHash.startsWith('/')
    ? withoutHash
    : `/${withoutHash}`;

  if (normalizedPath === APP_ROUTES.devicePreview) {
    return APP_ROUTES.dashboard;
  }

  return normalizedPath;
}

function resolvePreset(value: string | null): DevicePreset {
  return (
    DEVICE_PRESETS.find((preset) => preset.value === value) ?? DEFAULT_PRESET
  );
}

function normalizeDpr(
  value: string | null,
  fallback: number = DEFAULT_PRESET.deviceScaleFactor
): number {
  const parsed = Number(value);

  if (!Number.isFinite(parsed)) {
    return fallback;
  }

  return Math.min(Math.max(parsed, 1), 6);
}

function DevicePreviewControls({
  currentDpr,
  currentTarget,
  currentTargetOption,
  onApply,
  preset,
}: Readonly<DevicePreviewControlsProps>): ReactElement {
  const [draftRoute, setDraftRoute] = useState(currentTarget);
  const [draftDpr, setDraftDpr] = useState<string | number>(currentDpr);

  return (
    <Stack gap="md">
      <Select
        data={DEVICE_PRESETS.map(({ label, value }) => ({
          label,
          value,
        }))}
        label="Пресет телефона"
        value={preset.value}
        onChange={(value) => {
          const nextPreset = resolvePreset(value);
          setDraftDpr(nextPreset.deviceScaleFactor);
          onApply(currentTarget, nextPreset, nextPreset.deviceScaleFactor);
        }}
      />

      <Select
        data={ROUTE_OPTIONS}
        label="Быстрый переход"
        value={currentTargetOption}
        onChange={(value) => {
          if (value !== null) {
            setDraftRoute(value);
            onApply(value, preset, currentDpr);
          }
        }}
      />

      <NumberInput
        allowDecimal
        decimalScale={3}
        hideControls
        label="DPR"
        min={1}
        max={6}
        step={0.125}
        value={draftDpr}
        onChange={setDraftDpr}
      />

      <TextInput
        description="Любой hash route приложения, например /settings или /arrivals/create."
        label="Путь для превью"
        value={draftRoute}
        onChange={(event) => setDraftRoute(event.currentTarget.value)}
      />

      <Group className={styles.controlsActions} justify="flex-start">
        <Button
          onClick={() =>
            onApply(
              draftRoute,
              preset,
              normalizeDpr(String(draftDpr), preset.deviceScaleFactor)
            )
          }
        >
          Применить
        </Button>
        <Button
          component="a"
          href={`/#${currentTarget}`}
          target="_blank"
          variant="default"
        >
          Открыть отдельно
        </Button>
      </Group>
    </Stack>
  );
}

export function DevicePreviewPage(): ReactElement {
  const [searchParams, setSearchParams] = useSearchParams();

  const selectedPreset = useMemo(
    () => resolvePreset(searchParams.get('preset')),
    [searchParams]
  );
  const targetRoute = useMemo(
    () => normalizePreviewTarget(searchParams.get('target')),
    [searchParams]
  );
  const dpr = useMemo(
    () =>
      normalizeDpr(searchParams.get('dpr'), selectedPreset.deviceScaleFactor),
    [searchParams, selectedPreset.deviceScaleFactor]
  );
  const iframeSource = useMemo(() => `/#${targetRoute}`, [targetRoute]);
  const currentTargetOption =
    ROUTE_OPTIONS.find((option) => option.value === targetRoute)?.value ?? null;

  function applyPreview(
    nextTarget: string,
    nextPreset: DevicePreset,
    nextDpr: number
  ): void {
    const normalizedTarget = normalizePreviewTarget(nextTarget);
    const params = new URLSearchParams();

    if (normalizedTarget !== APP_ROUTES.dashboard) {
      params.set('target', normalizedTarget);
    }

    if (nextPreset.value !== DEFAULT_PRESET.value) {
      params.set('preset', nextPreset.value);
    }

    if (nextDpr !== nextPreset.deviceScaleFactor) {
      params.set('dpr', String(nextDpr));
    }

    setSearchParams(params);
  }

  const previewVars = {
    '--device-preview-viewport-height': `${selectedPreset.height / 16}rem`,
    '--device-preview-viewport-width': `${selectedPreset.width / 16}rem`,
  } as CSSProperties;

  return (
    <div className={styles.root}>
      <div className={styles.page}>
        <div className={styles.pageIntro}>
          <div>
            <Title order={1}>Device Preview</Title>
            <Text c="dimmed" size="sm">
              Dev-only surface для проверки мобильной геометрии без дублирования
              основного shell вокруг iframe.
            </Text>
          </div>
        </div>

        <div className={styles.workspace}>
          <Paper className={styles.sidebar} p="lg" radius="xl" withBorder>
            <Stack gap="lg">
              <div>
                <Text fw={700}>Настройки preview</Text>
              </div>

              <DevicePreviewControls
                key={`${selectedPreset.value}:${targetRoute}:${dpr}`}
                currentDpr={dpr}
                currentTarget={targetRoute}
                currentTargetOption={currentTargetOption}
                onApply={applyPreview}
                preset={selectedPreset}
              />

              <div className={styles.metrics}>
                <Paper
                  className={styles.metricCard}
                  p="md"
                  radius="lg"
                  withBorder
                >
                  <Text c="dimmed" size="xs">
                    Устройство
                  </Text>
                  <Text fw={700} size="sm">
                    {selectedPreset.label}
                  </Text>
                </Paper>
                <Paper
                  className={styles.metricCard}
                  p="md"
                  radius="lg"
                  withBorder
                >
                  <Text c="dimmed" size="xs">
                    Viewport
                  </Text>
                  <Text fw={700} size="sm">
                    {selectedPreset.width} x {selectedPreset.height}
                  </Text>
                </Paper>
                <Paper
                  className={styles.metricCard}
                  p="md"
                  radius="lg"
                  withBorder
                >
                  <Text c="dimmed" size="xs">
                    DPR
                  </Text>
                  <Text fw={700} size="sm">
                    {dpr}
                  </Text>
                </Paper>
                <Paper
                  className={styles.metricCard}
                  p="md"
                  radius="lg"
                  withBorder
                >
                  <Text c="dimmed" size="xs">
                    Активный маршрут
                  </Text>
                  <Code>{targetRoute}</Code>
                </Paper>
                <Paper
                  className={styles.metricCard}
                  p="md"
                  radius="lg"
                  withBorder
                >
                  <Text c="dimmed" size="xs">
                    Iframe src
                  </Text>
                  <Code>{iframeSource}</Code>
                </Paper>
              </div>
            </Stack>
          </Paper>

          <Paper className={styles.previewPanel} p="lg" radius="xl" withBorder>
            <Stack className={styles.previewStack} gap="md">
              <div className={styles.previewHeader}>
                <div>
                  <Text fw={700}>Фрейм устройства</Text>
                </div>
                <Code>{selectedPreset.label}</Code>
              </div>

              <div className={styles.previewViewport}>
                <div
                  className={styles.deviceFrame}
                  data-testid="device-preview-frame"
                  style={previewVars}
                >
                  <div className={styles.screen}>
                    <iframe
                      className={styles.screenFrame}
                      data-testid="device-preview-iframe"
                      src={iframeSource}
                      title={`${selectedPreset.label} preview for ${targetRoute}`}
                    />
                  </div>
                </div>
              </div>
            </Stack>
          </Paper>
        </div>
      </div>
    </div>
  );
}
