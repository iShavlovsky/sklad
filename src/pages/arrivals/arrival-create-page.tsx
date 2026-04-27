import type { ReactElement } from 'react';

import { ArrivalEditor } from '@/features/arrivals/editor/arrival-editor.tsx';
import {
  BottomSpacer,
  PageContainer,
  SectionStack,
} from '@/shared/ui/page-primitives';

export function ArrivalCreatePage(): ReactElement {
  return (
    <PageContainer scrollable={false}>
      <SectionStack fillHeight>
        <section style={{ display: 'flex', flex: '1 1 auto', minHeight: 0 }}>
          <ArrivalEditor mode="create" />
        </section>
      </SectionStack>
      <BottomSpacer compact />
    </PageContainer>
  );
}
