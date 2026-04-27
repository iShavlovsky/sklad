import type { ReactElement } from 'react';
import { Accordion, Stack } from '@mantine/core';
import type { UseFormReturnType } from '@mantine/form';

import type { ArrivalDetails } from '@/domain/queries/arrival/arrival-details.query.ts';
import {
  FormSectionAccordion,
  formSectionAccordionProps,
} from '@/features/form-fields/form-section-accordion';

import { DEPARTURE_FORM_SECTION_IDS } from './model/departure-editor.form-constants.ts';
import type { DepartureEditorFormValues } from './model/departure-editor.form-values.ts';
import { DepartureAdditionalSection } from './sections/departure-editor.additional-section.tsx';
import { DepartureDirectoriesSection } from './sections/departure-editor.directories-section.tsx';
import { DepartureMainSection } from './sections/departure-editor.main-section.tsx';
import { DepartureRelationSection } from './sections/departure-editor.relation-section.tsx';

type DepartureEditorFormSectionsProps = {
  arrivalOptions: Array<{ label: string; value: string }>;
  bufferItemCount: number;
  form: UseFormReturnType<DepartureEditorFormValues>;
  linkedArrivalDetails: ArrivalDetails | null | undefined;
  occurredAtValue: string;
  openedSections: string[];
  selectedArrivalId: string;
  onApplyLinkedArrival: () => void;
  onClearLinkedArrival: () => void;
  onOccurredAtChange: (value: string) => void;
  onOpenBufferPicker: () => void;
  onOpenScanner: () => void;
  onOpenedSectionsChange: (value: string[]) => void;
  onSearchChange: (value: string) => void;
  onSelectedArrivalChange: (value: string) => void;
};

export function DepartureEditorFormSections({
  arrivalOptions,
  bufferItemCount,
  form,
  linkedArrivalDetails,
  occurredAtValue,
  onApplyLinkedArrival,
  onClearLinkedArrival,
  onOccurredAtChange,
  onOpenBufferPicker,
  onOpenScanner,
  onOpenedSectionsChange,
  onSearchChange,
  onSelectedArrivalChange,
  openedSections,
  selectedArrivalId,
}: Readonly<DepartureEditorFormSectionsProps>): ReactElement {
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
      <div id={DEPARTURE_FORM_SECTION_IDS.main}>
        <DepartureMainSection
          bufferItemCount={bufferItemCount}
          form={form}
          occurredAtValue={occurredAtValue}
          onOccurredAtChange={onOccurredAtChange}
          onOpenBufferPicker={onOpenBufferPicker}
          onOpenScanner={onOpenScanner}
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
        <div id={DEPARTURE_FORM_SECTION_IDS.directories}>
          <FormSectionAccordion
            helpKey="section.directories.departure"
            title="Справочники"
            value="directories"
          >
            <DepartureDirectoriesSection form={form} />
          </FormSectionAccordion>
        </div>

        <div id={DEPARTURE_FORM_SECTION_IDS.relation}>
          <FormSectionAccordion
            helpKey="section.relation.departure"
            title="Связь с приходом"
            value="relation"
          >
            <DepartureRelationSection
              arrivalOptions={arrivalOptions}
              linkedArrival={linkedArrivalDetails}
              onApplyLinkedArrival={onApplyLinkedArrival}
              onClearLinkedArrival={onClearLinkedArrival}
              onSearchChange={onSearchChange}
              onSelectedArrivalChange={onSelectedArrivalChange}
              selectedArrivalId={selectedArrivalId}
            />
          </FormSectionAccordion>
        </div>

        <div id={DEPARTURE_FORM_SECTION_IDS.additional}>
          <FormSectionAccordion
            helpKey="section.additional.departure"
            title="Дополнительно"
            value="additional"
          >
            <DepartureAdditionalSection form={form} />
          </FormSectionAccordion>
        </div>
      </Accordion>
    </Stack>
  );
}
