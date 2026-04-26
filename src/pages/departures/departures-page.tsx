import type { ReactElement } from 'react';
import { useLocation } from 'react-router-dom';
import { Alert, Stack } from '@mantine/core';

import { BottomSpacer, PageContainer } from '@/shared/ui/page-primitives';

import { DeparturesListSection } from './sections/departures-list-section.tsx';

export function DeparturesPage(): ReactElement {
  const location = useLocation();
  const successMessage =
    typeof location.state === 'object' &&
    location.state !== null &&
    'departureCreated' in location.state &&
    typeof location.state.departureCreated === 'object' &&
    location.state.departureCreated !== null &&
    'message' in location.state.departureCreated &&
    typeof location.state.departureCreated.message === 'string'
      ? location.state.departureCreated.message
      : null;

  return (
    <PageContainer scrollable={false}>
      {successMessage ? (
        <Alert color="green" radius="md" variant="light">
          {successMessage}
        </Alert>
      ) : null}

      <Stack
        className="mobile-page-sections"
        gap="var(--sl-page-section-gap)"
        style={{ flex: '1 1 auto', minHeight: 0 }}
      >
        <DeparturesListSection />
      </Stack>

      <BottomSpacer />
    </PageContainer>
  );
}
