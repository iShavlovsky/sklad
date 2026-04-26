import type { ReactElement } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@mantine/core';

import {
  BottomSpacer,
  PageContainer,
  SectionStack,
} from '@/shared/ui/page-primitives';
import { PageSection } from '@/shared/ui/page-section';

export function NotFoundPage(): ReactElement {
  const navigate = useNavigate();

  return (
    <PageContainer>
      <SectionStack>
        <PageSection
          title="Маршрут не найден"
          description="Проверьте адрес или вернитесь на главный экран."
        >
          <Button onClick={() => navigate('/')}>На главную</Button>
        </PageSection>
      </SectionStack>

      <BottomSpacer />
    </PageContainer>
  );
}
