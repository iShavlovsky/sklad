import { type ReactElement } from 'react';

import { GoogleAccountSection } from '@/features/google/ui/google-account-section';
import {
  BottomSpacer,
  PageContainer,
  SectionStack,
} from '@/shared/ui/page-primitives';

export function SettingsProfilePage(): ReactElement {
  return (
    <PageContainer>
      <SectionStack>
        <GoogleAccountSection />
      </SectionStack>

      <BottomSpacer />
    </PageContainer>
  );
}
