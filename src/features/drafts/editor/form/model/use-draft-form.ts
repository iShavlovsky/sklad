import { useMemo, useState } from 'react';
import { useForm } from '@mantine/form';

import type { DraftDetails } from '@/domain/queries/draft/draft-details.query.ts';

import {
  createEmptyDraftValues,
  mapDraftDetailsToValues,
} from './draft-editor.form-mappers.ts';
import type {
  DraftEditorFormValues,
  DraftEditorMode,
} from './draft-editor.form-values.ts';
import { validateDraftForm } from './draft-editor.validation.ts';

interface UseDraftFormOptions {
  draftDetails: DraftDetails | null | undefined;
  mode: DraftEditorMode;
}

export function useDraftForm({
  draftDetails,
  mode,
}: Readonly<UseDraftFormOptions>) {
  const initialValues = useMemo(
    () =>
      mode === 'edit' && draftDetails
        ? mapDraftDetailsToValues(draftDetails)
        : createEmptyDraftValues(),
    [draftDetails, mode]
  );
  const [occurredAtValue, setOccurredAtValue] = useState(
    initialValues.occurredAt
  );
  const form = useForm<DraftEditorFormValues>({
    initialValues,
    mode: 'uncontrolled',
    validate: validateDraftForm,
  });

  return {
    form,
    occurredAtValue,
    setOccurredAtValue: (value: string) => {
      setOccurredAtValue(value);
      form.setFieldValue('occurredAt', value);
    },
  };
}
