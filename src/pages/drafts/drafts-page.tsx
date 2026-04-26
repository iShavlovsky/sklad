import type { ReactElement } from 'react';
import { Stack } from '@mantine/core';

import { BottomSpacer, PageContainer } from '@/shared/ui/page-primitives';

import { DraftsListSection } from './sections/drafts-list-section.tsx';

export function DraftsPage(): ReactElement {
  return (
    <PageContainer scrollable={false}>
      <Stack
        className="mobile-page-sections"
        gap="var(--sl-page-section-gap)"
        style={{ flex: '1 1 auto', minHeight: 0 }}
      >
        <DraftsListSection />
      </Stack>

      <BottomSpacer />
    </PageContainer>
  );
}
