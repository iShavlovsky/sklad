import type { ReactElement } from 'react';
import { Accordion } from '@mantine/core';
import type { UseFormReturnType } from '@mantine/form';

import type { ArrivalDetails } from '@/domain/queries/arrival/arrival-details.query.ts';
import {
  FormSectionAccordion,
  formSectionAccordionProps,
} from '@/features/form-fields/form-section-accordion';

import { DRAFT_EDITOR_SECTION_IDS } from './model/draft-editor.form-constants.ts';
import type {
  DraftEditorFormValues,
  DraftEditorMode,
} from './model/draft-editor.form-values.ts';
import { DraftAdditionalSection } from './sections/draft-editor.additional-section.tsx';
import { DraftDirectoriesSection } from './sections/draft-editor.directories-section.tsx';
import { DraftMainSection } from './sections/draft-editor.main-section.tsx';
import { DraftPublishMetaSection } from './sections/draft-editor.publish-meta-section.tsx';
import { DraftRelationSection } from './sections/draft-editor.relation-section.tsx';

type DraftEditorFormSectionsProps = {
  arrivalOptions: Array<{ label: string; value: string }>;
  form: UseFormReturnType<DraftEditorFormValues>;
  isPublishing: boolean;
  kind: DraftEditorFormValues['kind'];
  linkedArrivalDetails: ArrivalDetails | null | undefined;
  mode: DraftEditorMode;
  occurredAtValue: string;
  openedSections: string[];
  onApplyLinkedArrival: () => void;
  onClearLinkedArrival: () => void;
  onOccurredAtChange: (value: string) => void;
  onOpenedSectionsChange: (value: string[]) => void;
  onPublish: () => void;
  onSearchChange: (value: string) => void;
  onSelectedArrivalChange: (value: string) => void;
};

export function DraftEditorFormSections({
  arrivalOptions,
  form,
  isPublishing,
  kind,
  linkedArrivalDetails,
  mode,
  occurredAtValue,
  onApplyLinkedArrival,
  onClearLinkedArrival,
  onOccurredAtChange,
  onOpenedSectionsChange,
  onPublish,
  onSearchChange,
  onSelectedArrivalChange,
  openedSections,
}: Readonly<DraftEditorFormSectionsProps>): ReactElement {
  return (
    <>
      <div id={DRAFT_EDITOR_SECTION_IDS.main}>
        <DraftMainSection
          form={form}
          mode={mode}
          occurredAtValue={occurredAtValue}
          onOccurredAtChange={onOccurredAtChange}
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
        <div id={DRAFT_EDITOR_SECTION_IDS.directories}>
          <FormSectionAccordion
            helpKey="section.directories.draft"
            title="Справочники"
            value="directories"
          >
            <DraftDirectoriesSection form={form} />
          </FormSectionAccordion>
        </div>

        {kind === 'departure' ? (
          <div id={DRAFT_EDITOR_SECTION_IDS.relation}>
            <FormSectionAccordion
              helpKey="section.relation.draft"
              title="Связь с приходом"
              value="relation"
            >
              <DraftRelationSection
                arrivalOptions={arrivalOptions}
                linkedArrival={linkedArrivalDetails}
                onApplyLinkedArrival={onApplyLinkedArrival}
                onClearLinkedArrival={onClearLinkedArrival}
                onSearchChange={onSearchChange}
                onSelectedArrivalChange={onSelectedArrivalChange}
                selectedArrivalId={form.values.basedOnArrivalId}
              />
            </FormSectionAccordion>
          </div>
        ) : null}

        <div id={DRAFT_EDITOR_SECTION_IDS.additional}>
          <FormSectionAccordion
            helpKey="section.additional.draft"
            title="Дополнительно"
            value="additional"
          >
            <DraftAdditionalSection form={form} />
          </FormSectionAccordion>
        </div>

        {mode === 'edit' ? (
          <div id={DRAFT_EDITOR_SECTION_IDS.publishMeta}>
            <FormSectionAccordion
              helpKey="section.publish.draft"
              title="Публикация"
              value="publishMeta"
            >
              <DraftPublishMetaSection
                isPublishing={isPublishing}
                onPublish={onPublish}
              />
            </FormSectionAccordion>
          </div>
        ) : null}
      </Accordion>
    </>
  );
}
