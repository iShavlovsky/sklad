import { type ReactElement } from 'react';
import { Accordion, Text } from '@mantine/core';

import {
  BottomSpacer,
  PageContainer,
  SectionStack,
} from '@/shared/ui/page-primitives';
import { PageSection } from '@/shared/ui/page-section';

export function SettingsProfilePage(): ReactElement {
  return (
    <PageContainer>
      <SectionStack>
        <PageSection badge="Профиль" title="Данные профиля">
          <Accordion chevronPosition="right" variant="separated">
            <Accordion.Item value="profile">
              <Accordion.Control>Личные настройки</Accordion.Control>
              <Accordion.Panel>
                <Text c="dimmed" size="sm">
                  Здесь будут имя владельца, подпись и персональные параметры
                  профиля.
                </Text>
              </Accordion.Panel>
            </Accordion.Item>
          </Accordion>
        </PageSection>
      </SectionStack>

      <BottomSpacer />
    </PageContainer>
  );
}
