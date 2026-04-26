import type { ReactElement } from 'react';
import { Stack } from '@mantine/core';

import { BottomSpacer, PageContainer } from '@/shared/ui/page-primitives';

import { ArrivalsListSection } from './sections/arrivals-list-section.tsx';

export function ArrivalsPage(): ReactElement {
  return (
    <PageContainer scrollable={false}>
      <Stack
        className="mobile-page-sections"
        gap="var(--sl-page-section-gap)"
        style={{ flex: '1 1 auto', minHeight: 0 }}
      >
        <ArrivalsListSection />
      </Stack>

      <BottomSpacer />
    </PageContainer>
  );
}
