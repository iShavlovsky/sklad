import { type ReactElement } from 'react';
import { Text } from '@mantine/core';

import { appVersion, buildTimestamp } from '@/shared/config/app-version.ts';
import {
  BottomSpacer,
  PageContainer,
  SectionStack,
} from '@/shared/ui/page-primitives';
import { PageSection } from '@/shared/ui/page-section';

export function SettingsAboutPage(): ReactElement {
  return (
    <PageContainer>
      <SectionStack>
        <PageSection badge="Инфо" title="Сведения">
          <Text size="sm">Версия: {appVersion}</Text>
          <Text size="sm">Автор: Igor Shavlovsky</Text>
          <Text c="dimmed" size="sm">
            Время сборки: {buildTimestamp}
          </Text>
        </PageSection>
      </SectionStack>

      <BottomSpacer />
    </PageContainer>
  );
}
