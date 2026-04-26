import { type ReactElement, useMemo } from 'react';

import { useArrivalDetails } from '@/features/arrivals-data/hooks/use-arrival-details.ts';

import { ArrivalEditorForm } from './form/arrival-editor-form.tsx';
import { ARRIVAL_EDITOR_COPY } from './form/model/arrival-form.constants.ts';
import {
  createEmptyArrivalEditorValues,
  mapArrivalDetailsToEditorValues,
} from './form/model/arrival-form.mappers.ts';
import type { ArrivalEditorMode } from './form/model/arrival-form.types.ts';
import { ArrivalEditorLoadingState } from './arrival-editor-loading-state';
import { ArrivalEditorNotFoundState } from './arrival-editor-not-found-state';

interface ArrivalEditorProps {
  arrivalId?: string | null;
  mode: ArrivalEditorMode;
}

export function ArrivalEditor({
  arrivalId,
  mode,
}: Readonly<ArrivalEditorProps>): ReactElement {
  const details = useArrivalDetails(mode === 'edit' ? arrivalId : null);
  const titleText = ARRIVAL_EDITOR_COPY.title[mode];
  const initialValues = useMemo(
    () =>
      mode === 'edit' && details
        ? mapArrivalDetailsToEditorValues(details)
        : createEmptyArrivalEditorValues(),
    [details, mode]
  );

  if (mode === 'edit' && !arrivalId) {
    return <ArrivalEditorNotFoundState titleText={titleText} />;
  }

  if (mode === 'edit' && arrivalId && details === undefined) {
    return <ArrivalEditorLoadingState titleText={titleText} />;
  }

  if (mode === 'edit' && arrivalId && details === null) {
    return <ArrivalEditorNotFoundState titleText={titleText} />;
  }

  return (
    <ArrivalEditorForm
      arrivalId={arrivalId ?? null}
      initialValues={initialValues}
      mode={mode}
    />
  );
}
