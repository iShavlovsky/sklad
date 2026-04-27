import type { ReactElement } from 'react';
import { Alert, Button } from '@mantine/core';
import { IconAlertCircle } from '@tabler/icons-react';

import { useAppNavigate } from '@/router';
import { FormSectionCard } from '@/shared/ui/form-shell';

import { ARRIVAL_EDITOR_COPY } from './form/model/arrival-editor.form-constants.ts';

type ArrivalEditorNotFoundStateProps = {
  titleText?: string;
};

export function ArrivalEditorNotFoundState({
  titleText,
}: Readonly<ArrivalEditorNotFoundStateProps>): ReactElement {
  const navigate = useAppNavigate();

  return (
    <FormSectionCard description={titleText}>
      <Alert
        color="red"
        icon={<IconAlertCircle size={16} stroke={1.8} />}
        variant="light"
      >
        {ARRIVAL_EDITOR_COPY.notFound}
      </Alert>
      <Button
        onClick={() => navigate.to('root.arrivals')}
        type="button"
        variant="default"
      >
        К списку приходов
      </Button>
    </FormSectionCard>
  );
}
