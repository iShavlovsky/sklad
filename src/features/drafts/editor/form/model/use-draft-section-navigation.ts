import { useState } from 'react';

import { DRAFT_EDITOR_SECTION_IDS } from './draft-editor.form-constants.ts';
import type { DraftEditorSectionName } from './draft-editor.form-values.ts';

export function useDraftSectionNavigation() {
  const [openedSections, setOpenedSections] = useState<Array<string>>([]);

  function resolveErrorSection(
    errors: Record<string, unknown>
  ): DraftEditorSectionName {
    if (
      errors.linkUrl ||
      errors.note ||
      errors.direction ||
      errors.description
    ) {
      return 'additional';
    }
    if (errors.basedOnArrivalId) {
      return 'relation';
    }
    if (errors.supplierName || errors.productName || errors.categoryName) {
      return 'directories';
    }
    return 'main';
  }

  function ensureSectionOpen(section: DraftEditorSectionName): void {
    if (section === 'main') {
      return;
    }

    setOpenedSections((currentSections) =>
      currentSections.includes(section)
        ? currentSections
        : [...currentSections, section]
    );
  }

  function scrollToSection(section: DraftEditorSectionName): void {
    ensureSectionOpen(section);

    requestAnimationFrame(() => {
      document
        .getElementById(DRAFT_EDITOR_SECTION_IDS[section])
        ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }

  return {
    openedSections,
    resolveErrorSection,
    scrollToSection,
    setOpenedSections,
  };
}
