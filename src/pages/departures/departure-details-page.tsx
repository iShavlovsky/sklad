import type { ReactElement } from 'react';
import { useParams } from 'react-router-dom';
import { Badge, Button, Group, Stack, Text } from '@mantine/core';

import { useDepartureDetails } from '@/features/departures-data/hooks/use-departure-details.ts';
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
  DEPARTURE_MODE_LABELS,
  DEPARTURE_SUBJECT_KIND_LABELS,
  formatDepartureAmount,
  formatDepartureOccurredAt,
} from './lib/departures-page-formatters.ts';

export function DepartureDetailsPage(): ReactElement {
  const navigate = useAppNavigate();
  const params = useParams<'departureId'>();
  const departureId = params.departureId ?? '';
  const details = useDepartureDetails(departureId);
  const departure = details?.departure;

  return (
    <PageContainer>
      <PrimaryActionRow>
        <Button
          disabled={!departure}
          onClick={() =>
            navigate.to('root.departures.edit', {
              params: { departureId },
            })
          }
        >
          Редактировать
        </Button>
        <Button
          onClick={() => navigate.to('root.departures')}
          variant="default"
        >
          К списку
        </Button>
      </PrimaryActionRow>

      <SectionStack>
        {departure ? (
          <>
            <PageSection badge="Full" title="Основная информация">
              <Stack gap="md">
                <PreviewMetricGrid
                  metrics={[
                    {
                      field: 'occurredAt',
                      label: 'Дата события',
                      value: formatDepartureOccurredAt(departure.occurredAt),
                    },
                    {
                      field: 'amount',
                      label: 'Сумма',
                      value: formatDepartureAmount(
                        departure.amount,
                        departure.currency
                      ),
                    },
                    {
                      field: 'departureMode',
                      label: 'Режим',
                      value: DEPARTURE_MODE_LABELS[departure.mode],
                    },
                    {
                      field: 'subjectKind',
                      label: 'Тип',
                      value:
                        DEPARTURE_SUBJECT_KIND_LABELS[departure.subjectKind],
                    },
                  ]}
                />
                <Text
                  c={departure.description ? undefined : 'dimmed'}
                  size="sm"
                >
                  {departure.description || 'Описание не заполнено.'}
                </Text>
              </Stack>
            </PageSection>

            <PageSection badge="Связи" title="Справочники и контекст">
              <PreviewMetricGrid
                metrics={[
                  {
                    field: 'direction',
                    label: 'Направление',
                    value: departure.direction || '—',
                  },
                  {
                    field: 'supplier',
                    label: 'Поставщик',
                    value: departure.supplierName || '—',
                  },
                  {
                    field: 'product',
                    label: 'Товар',
                    value: departure.productName || '—',
                  },
                  {
                    field: 'category',
                    label: 'Категория',
                    value: departure.categoryName || '—',
                  },
                  {
                    field: 'note',
                    label: 'Заметка',
                    value: departure.note || '—',
                  },
                  {
                    field: 'source',
                    label: 'Связанный приход',
                    value: departure.basedOnArrivalId || '—',
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
          <PageSection badge="Нет данных" title="Расход не найден">
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
