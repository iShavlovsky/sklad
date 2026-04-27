import type { ReactElement } from 'react';
import { Accordion, Stack } from '@mantine/core';
import type { UseFormReturnType } from '@mantine/form';

import {
  FormSectionAccordion,
  formSectionAccordionProps,
} from '@/features/form-fields/form-section-accordion';

import { ARRIVAL_FORM_SECTION_IDS } from './model/arrival-editor.form-constants.ts';
import type { ArrivalEditorFormValues } from './model/arrival-editor.form-values.ts';
import { ArrivalAdditionalSection } from './sections/arrival-editor.additional-section.tsx';
import { ArrivalDirectoriesSection } from './sections/arrival-editor.directories-section.tsx';
import { ArrivalMainSection } from './sections/arrival-editor.main-section.tsx';

type ArrivalEditorFormSectionsProps = {
  bufferItemCount: number;
  form: UseFormReturnType<ArrivalEditorFormValues>;
  occurredAtValue: string;
  openedSections: string[];
  onOccurredAtChange: (value: string) => void;
  onOpenBufferPicker: () => void;
  onOpenedSectionsChange: (value: string[]) => void;
};

export function ArrivalEditorFormSections({
  bufferItemCount,
  form,
  occurredAtValue,
  onOccurredAtChange,
  onOpenBufferPicker,
  onOpenedSectionsChange,
  openedSections,
}: Readonly<ArrivalEditorFormSectionsProps>): ReactElement {
  return (
    <Stack
      gap="var(--sl-page-section-gap)"
      style={{
        flex: '1 1 auto',
        minHeight: 0,
        overflowY: 'auto',
        overscrollBehaviorY: 'contain',
        paddingBottom: '0.75rem',
      }}
    >
      <div id={ARRIVAL_FORM_SECTION_IDS.main}>
        <ArrivalMainSection
          bufferItemCount={bufferItemCount}
          form={form}
          occurredAtValue={occurredAtValue}
          onOccurredAtChange={onOccurredAtChange}
          onOpenBufferPicker={onOpenBufferPicker}
        />
      </div>

      <Accordion
        multiple
        onChange={(value) => {
          onOpenedSectionsChange(
            Array.isArray(value) ? value : value ? [value] : []
          );
        }}
        value={openedSections}
        {...formSectionAccordionProps}
      >
        <div id={ARRIVAL_FORM_SECTION_IDS.directories}>
          <FormSectionAccordion
            helpKey="section.directories.arrival"
            title="Справочники"
            value="directories"
          >
            <ArrivalDirectoriesSection form={form} />
          </FormSectionAccordion>
        </div>

        <div id={ARRIVAL_FORM_SECTION_IDS.additional}>
          <FormSectionAccordion
            helpKey="section.additional.arrival"
            title="Дополнительно"
            value="additional"
          >
            <ArrivalAdditionalSection form={form} />
          </FormSectionAccordion>
        </div>
      </Accordion>
    </Stack>
  );
}
