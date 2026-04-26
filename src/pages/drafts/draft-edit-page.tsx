import type { ReactElement } from 'react';
import { useParams } from 'react-router-dom';

import { DraftEditor } from '@/features/draft-editor';
import {
  BottomSpacer,
  PageContainer,
  SectionStack,
} from '@/shared/ui/page-primitives';

export function DraftEditPage(): ReactElement {
  const params = useParams<'draftId'>();

  return (
    <PageContainer scrollable={false}>
      <SectionStack fillHeight>
        <section style={{ display: 'flex', flex: '1 1 auto', minHeight: 0 }}>
          <DraftEditor draftId={params.draftId ?? null} mode="edit" />
        </section>
      </SectionStack>
      <BottomSpacer compact />
    </PageContainer>
  );
}
