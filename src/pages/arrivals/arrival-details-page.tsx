import type { ReactElement } from 'react';
import { useParams } from 'react-router-dom';
import { Badge, Button, Group, Stack, Text } from '@mantine/core';

import { useArrivalDetails } from '@/features/arrivals/data/hooks/use-arrival-details.ts';
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
  ARRIVAL_SUBJECT_KIND_LABELS,
  formatArrivalAmount,
  formatArrivalOccurredAt,
} from './lib/arrivals-page-formatters.ts';

export function ArrivalDetailsPage(): ReactElement {
  const navigate = useAppNavigate();
  const params = useParams<'arrivalId'>();
  const arrivalId = params.arrivalId ?? '';
  const details = useArrivalDetails(arrivalId);
  const arrival = details?.arrival;

  return (
    <PageContainer>
      <PrimaryActionRow>
        <Button
          disabled={!arrival}
          onClick={() =>
            navigate.to('root.arrivals.edit', {
              params: { arrivalId },
            })
          }
        >
          Редактировать
        </Button>
        <Button onClick={() => navigate.to('root.arrivals')} variant="default">
          К списку
        </Button>
      </PrimaryActionRow>

      <SectionStack>
        {arrival ? (
          <>
            <PageSection badge="Full" title="Основная информация">
              <Stack gap="md">
                <PreviewMetricGrid
                  metrics={[
                    {
                      field: 'occurredAt',
                      label: 'Дата события',
                      value: formatArrivalOccurredAt(arrival.occurredAt),
                    },
                    {
                      field: 'amount',
                      label: 'Сумма',
                      value: formatArrivalAmount(
                        arrival.amount,
                        arrival.currency,
                        arrival.quantity,
                        arrival.totalCost,
                        arrival.unitCost
                      ),
                    },
                    {
                      field: 'subjectKind',
                      label: 'Тип',
                      value: ARRIVAL_SUBJECT_KIND_LABELS[arrival.subjectKind],
                    },
                    {
                      field: 'updatedAt',
                      label: 'Обновлено',
                      value: formatArrivalOccurredAt(arrival.updatedAt),
                    },
                  ]}
                />
                <Text c={arrival.description ? undefined : 'dimmed'} size="sm">
                  {arrival.description || 'Описание не заполнено.'}
                </Text>
              </Stack>
            </PageSection>

            <PageSection badge="Связи" title="Справочники и контекст">
              <PreviewMetricGrid
                metrics={[
                  {
                    field: 'supplier',
                    label: 'Поставщик',
                    value: arrival.supplierName || '—',
                  },
                  {
                    field: 'product',
                    label: 'Товар',
                    value: arrival.productName || '—',
                  },
                  {
                    field: 'category',
                    label: 'Категория',
                    value: arrival.categoryName || '—',
                  },
                  {
                    field: 'linkUrl',
                    label: 'Ссылка',
                    value: arrival.linkUrl || '—',
                  },
                  {
                    field: 'note',
                    label: 'Заметка',
                    value: arrival.note || '—',
                  },
                  {
                    field: 'source',
                    label: 'Источник',
                    value: arrival.originKind,
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
          <PageSection badge="Нет данных" title="Приход не найден">
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
