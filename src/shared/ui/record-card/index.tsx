import type { ReactElement, ReactNode } from 'react';
import {
  ActionIcon,
  Badge,
  Box,
  Button,
  Card,
  Divider,
  Drawer,
  Group,
  SimpleGrid,
  Stack,
  Text,
  Title,
} from '@mantine/core';
import { IconEye } from '@tabler/icons-react';

import { getAppIconProps } from '@/app/theme/iconography/tokens.ts';
import type { FieldVisualKey } from '@/features/form-fields/field-visuals';
import { FieldToneIcon } from '@/features/form-fields/field-visuals';

import classes from './styles.module.css';

export interface RecordMetric {
  field: FieldVisualKey;
  label: string;
  value: ReactNode;
}

export interface RecordBadge {
  color?: string;
  label: ReactNode;
}

interface MiniRecordCardProps {
  badges?: readonly RecordBadge[];
  description?: ReactNode;
  leadingSlot?: ReactNode;
  metrics?: readonly RecordMetric[];
  onOpen?: () => void;
  openLabel: string;
  primaryValue?: ReactNode;
  subtitle: ReactNode;
  title: ReactNode;
}

export function MiniRecordCard({
  badges = [],
  description,
  leadingSlot,
  metrics,
  onOpen,
  openLabel,
  subtitle,
  title,
}: Readonly<MiniRecordCardProps>): ReactElement {
  const cardMetrics: RecordMetric[] = [
    {
      field: 'occurredAt',
      label: 'Дата',
      value: subtitle,
    },
    ...(metrics ?? []),
  ];

  return (
    <Card className={classes.card} component="article" p="xs" radius="lg">
      <Stack gap="xs">
        <Box className={classes.cardHeader}>
          {leadingSlot ? (
            <Box className={classes.leadingSlot}>{leadingSlot}</Box>
          ) : null}
          <Stack className={classes.heading} gap={2}>
            <Text fw={700} lineClamp={1} size="sm">
              {title}
            </Text>
          </Stack>

          <Stack align="flex-end" className={classes.headerActions} gap={6}>
            {onOpen ? (
              <ActionIcon
                aria-label={openLabel}
                onClick={onOpen}
                radius="md"
                size="md"
                variant="light"
              >
                <IconEye {...getAppIconProps('sm')} />
              </ActionIcon>
            ) : null}
          </Stack>
        </Box>

        {badges.length > 0 ? (
          <Group gap={6}>
            {badges.map((badge, index) => (
              <Badge
                className={classes.badge}
                color={badge.color ?? 'gray'}
                key={index}
                size="xs"
                variant="light"
              >
                {badge.label}
              </Badge>
            ))}
          </Group>
        ) : null}

        {cardMetrics.length > 0 ? (
          <SimpleGrid className={classes.metrics} cols={2} spacing={6}>
            {cardMetrics.map((metric) => (
              <RecordMetricItem
                key={`${metric.field}-${metric.label}`}
                {...metric}
              />
            ))}
          </SimpleGrid>
        ) : null}

        {description ? (
          <Text c="dimmed" lineClamp={2} size="xs">
            {description}
          </Text>
        ) : null}
      </Stack>
    </Card>
  );
}

export function RecordMetricItem({
  field,
  label,
  value,
}: Readonly<RecordMetric>): ReactElement {
  return (
    <Group className={classes.metric} gap={6} wrap="nowrap">
      <FieldToneIcon field={field} size="xs" />
      <Stack gap={0} miw={0}>
        <Text
          c="dimmed"
          className={classes.metricText}
          lineClamp={1}
          size="10px"
        >
          {label}
        </Text>
        <Text className={classes.metricText} fw={650} lineClamp={1} size="xs">
          {value}
        </Text>
      </Stack>
    </Group>
  );
}

interface RecordPreviewDrawerProps {
  actions?: ReactNode;
  children: ReactNode;
  onClose: () => void;
  opened: boolean;
  subtitle?: ReactNode;
  title: ReactNode;
}

export function RecordPreviewDrawer({
  actions,
  children,
  onClose,
  opened,
  title,
}: Readonly<RecordPreviewDrawerProps>): ReactElement {
  return (
    <Drawer
      classNames={{
        body: classes.drawerBody,
        content: classes.drawerContent,
        header: classes.drawerHeader,
      }}
      onClose={onClose}
      overlayProps={{ backgroundOpacity: 0.18, blur: 8 }}
      opened={opened}
      padding="md"
      position="bottom"
      size="min(78dvh, 38rem)"
      styles={{
        body: {
          paddingBlockStart: '1rem',
        },
      }}
      title={
        <Stack gap={2}>
          <Title order={3} size="h4">
            {title}
          </Title>
        </Stack>
      }
    >
      <Stack gap="md">
        {children}
        {actions ? (
          <>
            <Divider />
            <Group grow preventGrowOverflow={false}>
              {actions}
            </Group>
          </>
        ) : null}
      </Stack>
    </Drawer>
  );
}

interface PreviewMetricGridProps {
  metrics: readonly RecordMetric[];
}

export function PreviewMetricGrid({
  metrics,
}: Readonly<PreviewMetricGridProps>): ReactElement {
  return (
    <SimpleGrid cols={{ base: 2, xs: 3 }} spacing="xs">
      {metrics.map((metric) => (
        <RecordMetricItem key={`${metric.field}-${metric.label}`} {...metric} />
      ))}
    </SimpleGrid>
  );
}

interface PreviewActionButtonProps {
  children: ReactNode;
  color?: string;
  disabled?: boolean;
  onClick: () => void;
  variant?: 'default' | 'filled' | 'light';
}

export function PreviewActionButton({
  children,
  color,
  disabled = false,
  onClick,
  variant = 'default',
}: Readonly<PreviewActionButtonProps>): ReactElement {
  return (
    <Button
      color={color}
      disabled={disabled}
      onClick={onClick}
      size="xs"
      variant={variant}
    >
      {children}
    </Button>
  );
}
