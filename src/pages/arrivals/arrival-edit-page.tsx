import type { ReactElement } from 'react';
import { useParams } from 'react-router-dom';

import { ArrivalEditor } from '@/features/arrival-editor/arrival-editor.tsx';
import {
  BottomSpacer,
  PageContainer,
  SectionStack,
} from '@/shared/ui/page-primitives';

export function ArrivalEditPage(): ReactElement {
  const params = useParams<'arrivalId'>();

  return (
    <PageContainer scrollable={false}>
      <SectionStack fillHeight>
        <section style={{ display: 'flex', flex: '1 1 auto', minHeight: 0 }}>
          <ArrivalEditor arrivalId={params.arrivalId ?? null} mode="edit" />
        </section>
      </SectionStack>
      <BottomSpacer compact />
    </PageContainer>
  );
}
