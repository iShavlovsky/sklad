import type { ReactElement } from 'react';
import { useParams } from 'react-router-dom';
import { Button, Text } from '@mantine/core';

import { useAppNavigate } from '@/router';
import {
  BottomSpacer,
  PageContainer,
  PrimaryActionRow,
  SectionStack,
} from '@/shared/ui/page-primitives';
import { PageSection } from '@/shared/ui/page-section';

export function DepartureEditPage(): ReactElement {
  const navigate = useAppNavigate();
  const params = useParams<'departureId'>();
  const departureId = params.departureId ?? 'unknown';

  return (
    <PageContainer>
      <PrimaryActionRow>
        <Button
          onClick={() =>
            navigate.to('root.departures.details', {
              params: { departureId },
            })
          }
          variant="default"
        >
          К деталям
        </Button>
        <Button
          onClick={() => navigate.to('root.departures')}
          variant="default"
        >
          К списку
        </Button>
      </PrimaryActionRow>

      <SectionStack>
        <PageSection badge="Маршрут" title="Идентификатор отгрузки">
          <Text size="sm">{departureId}</Text>
        </PageSection>

        <PageSection
          badge="Заготовка"
          description="Здесь позже появится редактор отгрузки без изменения бизнес-логики."
          title="Поверхность редактирования отгрузки"
        />
      </SectionStack>

      <BottomSpacer />
    </PageContainer>
  );
}
