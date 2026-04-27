import { type ReactElement } from 'react';
import { IconCloudUpload, IconInfoCircle, IconUser } from '@tabler/icons-react';

import { APP_ROUTES } from '@/shared/config/routes.ts';
import { InfoAction } from '@/shared/ui/info-action';
import {
  BottomSpacer,
  PageContainer,
  SectionStack,
} from '@/shared/ui/page-primitives';
import { PageSection } from '@/shared/ui/page-section';

import { SettingsHubLink } from './settings-hub-link';
import { ThemePreferenceSection } from './theme-preference-section';

export function SettingsPage(): ReactElement {
  return (
    <PageContainer>
      <SectionStack>
        <ThemePreferenceSection />

        <PageSection
          badge="Разделы"
          description="Быстрый переход к связанным системным экранам."
          trailing={
            <InfoAction description="Эти разделы ведут к профилю, backup-центру и сведениям о приложении. Они не меняют журналы сами по себе." />
          }
        >
          <SettingsHubLink
            description="Профиль, имя, подпись и персональные параметры"
            icon={<IconUser size={16} />}
            label="Профиль"
            to={APP_ROUTES.settingsProfile}
          />
          <SettingsHubLink
            description="Резервные копии и журнал операций с данными"
            icon={<IconCloudUpload size={16} />}
            label="Резервные копии"
            to={APP_ROUTES.settingsBackup}
          />
          <SettingsHubLink
            description="Сведения о приложении, версии и поддержке"
            icon={<IconInfoCircle size={16} />}
            label="О приложении"
            to={APP_ROUTES.settingsAbout}
          />
        </PageSection>
      </SectionStack>

      <BottomSpacer />
    </PageContainer>
  );
}
