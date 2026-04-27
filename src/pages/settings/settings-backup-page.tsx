import type { ReactElement } from 'react';

import { BackupWorkflow } from '@/features/backup/ui/backup-workflow/backup-workflow';
import {
  BottomSpacer,
  PageContainer,
  SectionStack,
} from '@/shared/ui/page-primitives';

export function SettingsBackupPage(): ReactElement {
  return (
    <PageContainer>
      <SectionStack>
        <BackupWorkflow />
      </SectionStack>

      <BottomSpacer />
    </PageContainer>
  );
}
