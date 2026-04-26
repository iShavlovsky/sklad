import type { ReactElement } from 'react';
import { useParams } from 'react-router-dom';
import { Badge, Button, Group, Stack, Text } from '@mantine/core';

import { useDraftDetails } from '@/features/drafts-data/hooks/use-draft-details.ts';
import { useAppNavigate } from '@/router';
import {
  BottomSpacer,
  PageContainer,
  PrimaryActionRow,
  SectionStack,
} from '@/shared/ui/page-primitives';
import { PageSection } from '@/shared/ui/page-section';
import { PreviewMetricGrid } from '@/shared/ui/record-card';

import {
  DRAFT_KIND_LABELS,
  formatDraftDate,
} from './lib/drafts-page-formatters.ts';

export function DraftDetailsPage(): ReactElement {
  const navigate = useAppNavigate();
  const params = useParams<'draftId'>();
  const draftId = params.draftId ?? '';
  const details = useDraftDetails(draftId);
  const draft = details?.draft;
  const payload = draft?.payload;

  return (
    <PageContainer>
      <PrimaryActionRow>
        <Button
          disabled={!draft}
          onClick={() =>
            navigate.to('root.drafts.edit', {
              params: { draftId },
            })
          }
        >
          Редактировать
        </Button>
        <Button onClick={() => navigate.to('root.drafts')} variant="default">
          К списку
        </Button>
      </PrimaryActionRow>

      <SectionStack>
        {draft && payload ? (
          <>
            <PageSection badge="Full" title="Основная информация">
              <Stack gap="md">
                <PreviewMetricGrid
                  metrics={[
                    {
                      field: 'draftKind',
                      label: 'Сценарий',
                      value: DRAFT_KIND_LABELS[draft.kind],
                    },
                    {
                      field: 'updatedAt',
                      label: 'Создан',
                      value: formatDraftDate(draft.createdAt),
                    },
                    {
                      field: 'updatedAt',
                      label: 'Обновлен',
                      value: formatDraftDate(draft.updatedAt),
                    },
                    {
                      field: 'occurredAt',
                      label: 'Дата события',
                      value: payload.occurredAt
                        ? formatDraftDate(payload.occurredAt)
                        : '—',
                    },
                  ]}
                />
                <Text c={payload.description ? undefined : 'dimmed'} size="sm">
                  {payload.description || 'Описание не заполнено.'}
                </Text>
              </Stack>
            </PageSection>

            <PageSection badge="Контекст" title="Поля будущей записи">
              <PreviewMetricGrid
                metrics={[
                  {
                    field: 'supplier',
                    label: 'Поставщик',
                    value: payload.supplier.name || '—',
                  },
                  {
                    field: 'product',
                    label: 'Товар',
                    value: payload.product.name || '—',
                  },
                  {
                    field: 'category',
                    label: 'Категория',
                    value: payload.category.name || '—',
                  },
                  {
                    field: 'note',
                    label: 'Заметка',
                    value: payload.note || '—',
                  },
                  {
                    field: 'linkUrl',
                    label: 'Ссылка',
                    value: 'linkUrl' in payload ? payload.linkUrl || '—' : '—',
                  },
                  {
                    field: 'direction',
                    label: 'Направление',
                    value:
                      'direction' in payload ? payload.direction || '—' : '—',
                  },
                ]}
              />
            </PageSection>

            <PageSection badge="Коды" title="Связанные коды">
              <Group gap="xs">
                {details.codes.length > 0 ? (
                  details.codes.map((code) => (
                    <Badge key={code.id} variant="light">
                      {code.value}
                    </Badge>
                  ))
                ) : (
                  <Text c="dimmed" size="sm">
                    Связанных кодов нет.
                  </Text>
                )}
              </Group>
            </PageSection>
          </>
        ) : (
          <PageSection badge="Нет данных" title="Черновик не найден">
            <Text c="dimmed" size="sm">
              Запись могла быть удалена или еще не загружена.
            </Text>
          </PageSection>
        )}
      </SectionStack>

      <BottomSpacer />
    </PageContainer>
  );
}
