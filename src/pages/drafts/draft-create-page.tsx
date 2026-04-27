import type { ReactElement } from 'react';

import { DraftEditor } from '@/features/drafts/editor/form/draft-editor.form.tsx';
import {
  BottomSpacer,
  PageContainer,
  SectionStack,
} from '@/shared/ui/page-primitives';

export function DraftCreatePage(): ReactElement {
  return (
    <PageContainer scrollable={false}>
      <SectionStack fillHeight>
        <section style={{ display: 'flex', flex: '1 1 auto', minHeight: 0 }}>
          <DraftEditor mode="create" />
        </section>
      </SectionStack>
      <BottomSpacer compact />
    </PageContainer>
  );
}
