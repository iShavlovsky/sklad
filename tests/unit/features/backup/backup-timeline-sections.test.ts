/* eslint-disable react/no-unused-prop-types */
import { createElement, type ReactNode } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';

type MockComponentProps = {
  children?: ReactNode;
};

type MockTimelineProps = MockComponentProps & {
  'data-testid'?: string;
  active?: number;
};

type MockTimelineItemProps = MockComponentProps & {
  bullet?: ReactNode;
  color?: string;
  title?: ReactNode;
};

const captured = vi.hoisted(() => ({
  timelineItems: [] as MockTimelineItemProps[],
  timelines: [] as MockTimelineProps[],
}));

function passthrough({ children }: MockComponentProps): ReactNode {
  return children ?? null;
}

vi.mock('@mantine/core', () => {
  const Timeline = (props: MockTimelineProps): ReactNode => {
    captured.timelines.push(props);
    return createElement(
      'div',
      { 'data-testid': props['data-testid'] },
      props.children
    );
  };
  Timeline.Item = (props: MockTimelineItemProps): ReactNode => {
    captured.timelineItems.push(props);
    return createElement(
      'div',
      null,
      props.bullet,
      props.title,
      props.children
    );
  };

  const Accordion = Object.assign(passthrough, {
    Control: passthrough,
    Item: passthrough,
    Panel: passthrough,
  });

  return {
    Accordion,
    ActionIcon: passthrough,
    Badge: passthrough,
    Box: passthrough,
    Card: passthrough,
    Group: passthrough,
    Popover: Object.assign(passthrough, {
      Dropdown: passthrough,
      Target: passthrough,
    }),
    Stack: passthrough,
    Text: passthrough,
    ThemeIcon: passthrough,
    Timeline,
    Title: passthrough,
  };
});

vi.mock('@tabler/icons-react', () => ({
  IconAlertCircle: (): null => null,
  IconDatabaseExport: (): null => null,
  IconDownload: (): null => null,
  IconFileCheck: (): null => null,
  IconHistory: (): null => null,
  IconInfoCircle: (): null => null,
  IconRestore: (): null => null,
  IconShieldCheck: (): null => null,
}));

import {
  BackupActivityTimelineSection,
  BackupOperationsTimelineSection,
} from '../../../../src/features/backup/ui/backup-workflow/backup-history-section.tsx';

describe('backup timeline sections', () => {
  beforeEach(() => {
    captured.timelineItems.length = 0;
    captured.timelines.length = 0;
  });

  it('preserves separated empty states without rendering timelines', () => {
    const operationsMarkup = renderToStaticMarkup(
      createElement(BackupOperationsTimelineSection, { entries: [] })
    );
    const activityMarkup = renderToStaticMarkup(
      createElement(BackupActivityTimelineSection, { entries: [] })
    );

    expect(operationsMarkup).toContain('Операций backup пока нет.');
    expect(activityMarkup).toContain(
      'Общая история backup и checkpoint пока пуста.'
    );
    expect(captured.timelines).toHaveLength(0);
  });

  it('renders backup operations timeline with backup labels only', () => {
    const markup = renderToStaticMarkup(
      createElement(BackupOperationsTimelineSection, {
        entries: [
          {
            action: 'export',
            createdAt: '2026-01-01T10:00:00.000Z',
            details: null,
            id: 'history-export',
            status: 'success',
            summary: 'exported',
          },
          {
            action: 'restore',
            createdAt: '2026-01-01T11:00:00.000Z',
            details: null,
            id: 'history-restore',
            status: 'success',
            summary: 'restored',
          },
          {
            action: 'import-dry-run',
            createdAt: '2026-01-01T12:00:00.000Z',
            details: null,
            id: 'history-import',
            status: 'success',
            summary: 'validated',
          },
        ],
      })
    );

    expect(captured.timelines.at(-1)).toMatchObject({
      'data-testid': 'backup-operations-timeline',
      active: 3,
    });
    expect(markup).toContain('Экспорт');
    expect(markup).toContain('Восстановление');
    expect(markup).toContain('Импорт');
    expect(markup).not.toContain('Checkpoint');
    expect(captured.timelineItems.map((item) => item.color)).toEqual([
      'blue',
      'orange',
      'violet',
    ]);
  });

  it('renders common activity timeline with backup and checkpoint as different item kinds', () => {
    const markup = renderToStaticMarkup(
      createElement(BackupActivityTimelineSection, {
        entries: [
          {
            kind: 'backup',
            record: {
              action: 'export',
              createdAt: '2026-01-01T10:00:00.000Z',
              details: null,
              id: 'history-export',
              status: 'success',
              summary: 'Exported 31 records across 12 data groups',
            },
          },
          {
            kind: 'checkpoint',
            record: {
              createdAt: '2026-01-01T11:00:00.000Z',
              id: 'checkpoint-1',
              label: 'Manual checkpoint',
              snapshot: {
                arrivals: [],
                backupCheckpoints: [],
                backupHistory: [],
                categories: [],
                departures: [],
                drafts: [],
                exportedAt: '2026-01-01T11:00:00.000Z',
                favorites: [],
                products: [],
                profiles: [],
                recordCodes: [],
                settings: [],
                suppliers: [],
                version: 1,
              },
            },
          },
        ],
      })
    );

    expect(captured.timelines.at(-1)).toMatchObject({
      'data-testid': 'backup-activity-timeline',
      active: 2,
    });
    expect(markup).toContain('Экспорт');
    expect(markup).toContain('Checkpoint');
    expect(markup).toContain('Manual checkpoint');
    expect(markup).toContain('payload v1');
    expect(captured.timelineItems.map((item) => item.color)).toEqual([
      'blue',
      'teal',
    ]);
  });
});
