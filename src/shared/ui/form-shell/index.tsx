import type { PropsWithChildren, ReactElement, ReactNode } from 'react';
import { Box, Card, Group, Paper, Stack, Text, Title } from '@mantine/core';

import styles from './styles.module.css';

interface FormSectionCardProps extends PropsWithChildren {
  description?: ReactNode;
  title?: ReactNode;
}

interface FormStickyActionsProps extends PropsWithChildren {
  primaryAction: ReactNode;
  secondaryAction?: ReactNode;
}

export function FormSectionCard({
  children,
  description,
  title,
}: Readonly<FormSectionCardProps>): ReactElement {
  return (
    <Card data-overlay-boundary padding="sm">
      <Stack gap="xs">
        {title || description ? (
          <Stack gap={4}>
            {title ? (
              <Title component="div" order={2} size="h4">
                {title}
              </Title>
            ) : null}
            {description ? (
              <Text c="dimmed" size="sm">
                {description}
              </Text>
            ) : null}
          </Stack>
        ) : null}
        {children}
      </Stack>
    </Card>
  );
}

export function FormStickyActions({
  children,
  primaryAction,
  secondaryAction,
}: Readonly<FormStickyActionsProps>): ReactElement {
  return (
    <Paper className={styles.stickyActions} p="xs" radius="md" withBorder>
      <Group className={styles.actionRail} gap="xs" wrap="wrap">
        {children ? <Box className={styles.metaSlot}>{children}</Box> : null}
        {secondaryAction ? (
          <Box className={styles.secondaryButton}>{secondaryAction}</Box>
        ) : null}
        <Box className={styles.primarySlot}>{primaryAction}</Box>
      </Group>
    </Paper>
  );
}
