import { useMemo, useState } from 'react';
import { useForm } from '@mantine/form';

import {
  applyDepartureCreatePreferences,
  formatIsoForDateTimePicker,
} from './departure-form.mappers.ts';
import type { DepartureEditorFormValues } from './departure-form.types.ts';
import { validateDepartureForm } from './departure-form.validation.ts';

interface UseDepartureFormOptions {
  initialValues: DepartureEditorFormValues;
}

export function useDepartureForm({
  initialValues,
}: Readonly<UseDepartureFormOptions>) {
  const hydratedInitialValues = useMemo(
    () => applyDepartureCreatePreferences(initialValues),
    [initialValues]
  );
  const [occurredAtValue, setOccurredAtValue] = useState(
    hydratedInitialValues.occurredAt
  );
  const form = useForm<DepartureEditorFormValues>({
    initialValues: hydratedInitialValues,
    mode: 'uncontrolled',
    validate: validateDepartureForm,
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
