import type { ReactElement } from 'react';
import {
  Accordion,
  Badge,
  Group,
  Stack,
  Text,
  ThemeIcon,
  Timeline,
} from '@mantine/core';
import {
  IconAlertCircle,
  IconDatabaseExport,
  IconDownload,
  IconFileCheck,
  IconHistory,
  IconRestore,
  IconShieldCheck,
} from '@tabler/icons-react';

import type {
  BackupCheckpointRecord,
  BackupHistoryRecord,
} from '@/domain/backup';
import { InfoAction } from '@/shared/ui/info-action';
import { PageSection } from '@/shared/ui/page-section';

import { formatDateTime } from './backup-workflow.model.ts';

type BackupTimelinePresentation = {
  color: string;
  icon: ReactElement;
  label: string;
};

type BackupActivityEntry =
  | {
      kind: 'backup';
      record: BackupHistoryRecord;
    }
  | {
      kind: 'checkpoint';
      record: BackupCheckpointRecord;
    };

type BackupOperationsTimelineSectionProps = {
  entries: BackupHistoryRecord[];
};

type BackupActivityTimelineSectionProps = {
  entries: BackupActivityEntry[];
};

function getBackupPresentation(
  entry: BackupHistoryRecord
): BackupTimelinePresentation {
  const action = entry.action.toLowerCase();

  if (entry.status === 'error') {
    return {
      color: 'red',
      icon: <IconAlertCircle size={13} stroke={1.9} />,
      label: action.includes('restore') ? 'Восстановление' : entry.action,
    };
  }

  if (action.includes('export')) {
    return {
      color: 'blue',
      icon: <IconDownload size={13} stroke={1.9} />,
      label: 'Экспорт',
    };
  }

  if (action.includes('restore')) {
    return {
      color: 'orange',
      icon: <IconRestore size={13} stroke={1.9} />,
      label: 'Восстановление',
    };
  }

  if (action.includes('import')) {
    return {
      color: 'violet',
      icon: <IconFileCheck size={13} stroke={1.9} />,
      label: 'Импорт',
    };
  }

  return {
    color: 'gray',
    icon: <IconHistory size={13} stroke={1.9} />,
    label: entry.action,
  };
}

function getCheckpointPresentation(): BackupTimelinePresentation {
  return {
    color: 'teal',
    icon: <IconShieldCheck size={13} stroke={1.9} />,
    label: 'Checkpoint',
  };
}

function renderTimelineBullet(presentation: BackupTimelinePresentation) {
  return (
    <ThemeIcon color={presentation.color} radius="xl" size={22} variant="light">
      {presentation.icon}
    </ThemeIcon>
  );
}

function BackupOperationTimeline({
  entries,
  testId,
}: {
  entries: BackupHistoryRecord[];
  testId: string;
}): ReactElement {
  return (
    <Timeline
      active={entries.length}
      bulletSize={28}
      data-testid={testId}
      lineWidth={2}
    >
      {entries.map((entry) => {
        const presentation = getBackupPresentation(entry);
        const statusColor =
          entry.status === 'success' ? 'green' : presentation.color;

        return (
          <Timeline.Item
            bullet={renderTimelineBullet(presentation)}
            color={presentation.color}
            key={entry.id}
            title={
              <Group gap="xs" wrap="wrap">
                <Badge color={presentation.color} variant="light">
                  {presentation.label}
                </Badge>
                <Badge color={statusColor} variant="light">
                  {entry.status}
                </Badge>
                <Text c="dimmed" size="xs">
                  {formatDateTime(entry.createdAt)}
                </Text>
              </Group>
            }
          >
            <Text size="sm">{entry.summary}</Text>
          </Timeline.Item>
        );
      })}
    </Timeline>
  );
}

function BackupActivityTimeline({
  entries,
}: {
  entries: BackupActivityEntry[];
}): ReactElement {
  return (
    <Timeline
      active={entries.length}
      bulletSize={28}
      data-testid="backup-activity-timeline"
      lineWidth={2}
    >
      {entries.map((entry) => {
        if (entry.kind === 'checkpoint') {
          const presentation = getCheckpointPresentation();

          return (
            <Timeline.Item
              bullet={renderTimelineBullet(presentation)}
              color={presentation.color}
              key={`checkpoint-${entry.record.id}`}
              title={
                <Group gap="xs" wrap="wrap">
                  <Badge color={presentation.color} variant="light">
                    {presentation.label}
                  </Badge>
                  <Badge color="blue" variant="light">
                    payload v{entry.record.snapshot.version}
                  </Badge>
                  <Text c="dimmed" size="xs">
                    {formatDateTime(entry.record.createdAt)}
                  </Text>
                </Group>
              }
            >
              <Text c="dimmed" size="sm">
                {entry.record.label}. Точка восстановления из текущего backup
                payload.
              </Text>
            </Timeline.Item>
          );
        }

        const presentation = getBackupPresentation(entry.record);
        const statusColor =
          entry.record.status === 'success' ? 'green' : presentation.color;

        return (
          <Timeline.Item
            bullet={
              <ThemeIcon
                color={presentation.color}
                radius="xl"
                size={22}
                variant="light"
              >
                {entry.record.action === 'export' ? (
                  <IconDatabaseExport size={13} stroke={1.9} />
                ) : (
                  presentation.icon
                )}
              </ThemeIcon>
            }
            color={presentation.color}
            key={`backup-${entry.record.id}`}
            title={
              <Group gap="xs" wrap="wrap">
                <Badge color={presentation.color} variant="light">
                  {presentation.label}
                </Badge>
                <Badge color={statusColor} variant="light">
                  {entry.record.status}
                </Badge>
                <Text c="dimmed" size="xs">
                  {formatDateTime(entry.record.createdAt)}
                </Text>
              </Group>
            }
          >
            <Text size="sm">{entry.record.summary}</Text>
          </Timeline.Item>
        );
      })}
    </Timeline>
  );
}

export function BackupOperationsTimelineSection({
  entries,
}: Readonly<BackupOperationsTimelineSectionProps>): ReactElement {
  return (
    <PageSection
      badge="Backup"
      trailing={
        <InfoAction description="Здесь показаны только операции backup: экспорт, проверка импорта и восстановление. Внутренние checkpoint-события вынесены из этого журнала." />
      }
    >
      <Accordion defaultValue="backup-operations" variant="contained">
        <Accordion.Item value="backup-operations">
          <Accordion.Control>Операции backup</Accordion.Control>
          <Accordion.Panel>
            <Stack gap="sm">
              {entries.length === 0 ? (
                <Text c="dimmed" size="sm">
                  Операций backup пока нет.
                </Text>
              ) : (
                <BackupOperationTimeline
                  entries={entries}
                  testId="backup-operations-timeline"
                />
              )}
            </Stack>
          </Accordion.Panel>
        </Accordion.Item>
      </Accordion>
    </PageSection>
  );
}

export function BackupActivityTimelineSection({
  entries,
}: Readonly<BackupActivityTimelineSectionProps>): ReactElement {
  return (
    <PageSection
      badge="История"
      trailing={
        <InfoAction description="Общая история объединяет операции backup и checkpoint как разные типы событий. Checkpoint остается точкой восстановления, backup остается файлом экспорта или восстановлением." />
      }
    >
      <Accordion defaultValue="backup-activity" variant="contained">
        <Accordion.Item value="backup-activity">
          <Accordion.Control>Общий timeline</Accordion.Control>
          <Accordion.Panel>
            <Stack gap="sm">
              {entries.length === 0 ? (
                <Text c="dimmed" size="sm">
                  Общая история backup и checkpoint пока пуста.
                </Text>
              ) : (
                <BackupActivityTimeline entries={entries} />
              )}
            </Stack>
          </Accordion.Panel>
        </Accordion.Item>
      </Accordion>
    </PageSection>
  );
}

export type { BackupActivityEntry };
