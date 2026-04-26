import type { ReactElement } from 'react';
import { Loader, Text } from '@mantine/core';

import { FormSectionCard } from '@/shared/ui/form-shell';

import { ARRIVAL_EDITOR_COPY } from './form/model/arrival-form.constants.ts';

type ArrivalEditorLoadingStateProps = {
  titleText?: string;
};

export function ArrivalEditorLoadingState({
  titleText,
}: Readonly<ArrivalEditorLoadingStateProps>): ReactElement {
  return (
    <FormSectionCard description={titleText}>
      <Loader size="sm" />
      <Text c="dimmed" size="sm">
        {ARRIVAL_EDITOR_COPY.loading}
      </Text>
    </FormSectionCard>
  );
}
