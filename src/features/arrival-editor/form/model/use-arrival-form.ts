import { useMemo, useState } from 'react';
import { useForm } from '@mantine/form';

import {
  applyArrivalCreatePreferences,
  formatIsoForDateTimePicker,
} from './arrival-form.mappers.ts';
import type {
  ArrivalEditorFormValues,
  ArrivalEditorMode,
} from './arrival-form.types.ts';
import { validateArrivalForm } from './arrival-form.validation.ts';

interface UseArrivalFormOptions {
  initialValues: ArrivalEditorFormValues;
  mode: ArrivalEditorMode;
}

export function useArrivalForm({
  initialValues,
  mode,
}: Readonly<UseArrivalFormOptions>) {
  const hydratedInitialValues = useMemo(
    () =>
      mode === 'create'
        ? applyArrivalCreatePreferences(initialValues)
        : initialValues,
    [initialValues, mode]
  );
  const [occurredAtValue, setOccurredAtValue] = useState(
    hydratedInitialValues.occurredAt
  );
  const form = useForm<ArrivalEditorFormValues>({
    initialValues: hydratedInitialValues,
    mode: 'uncontrolled',
    validate: validateArrivalForm,
  });

  return {
    form,
    occurredAtValue,
    setOccurredAtValue: (value: string) => {
      setOccurredAtValue(formatIsoForDateTimePicker(value));
      form.setFieldValue('occurredAt', value);
    },
  };
}
