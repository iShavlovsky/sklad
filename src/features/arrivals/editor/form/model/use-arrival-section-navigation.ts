import { useState } from 'react';

import { ARRIVAL_FORM_SECTION_IDS } from './arrival-editor.form-constants.ts';
import type { ArrivalEditorSectionName } from './arrival-editor.form-values.ts';

export function useArrivalSectionNavigation() {
  const [openedSections, setOpenedSections] = useState<Array<string>>([]);

  function resolveErrorSection(
    errors: Record<string, unknown>
  ): ArrivalEditorSectionName {
    if (errors.linkUrl || errors.note || errors.description) {
      return 'additional';
    }

    if (
      errors['supplier.name'] ||
      errors['product.name'] ||
      errors['category.name']
    ) {
      return 'directories';
    }

    return 'main';
  }

  function ensureSectionOpen(section: ArrivalEditorSectionName): void {
    if (section === 'main') {
      return;
    }

    setOpenedSections((currentSections) =>
      currentSections.includes(section)
        ? currentSections
        : [...currentSections, section]
    );
  }

  function scrollToSection(section: ArrivalEditorSectionName): void {
    ensureSectionOpen(section);

    requestAnimationFrame(() => {
      document
        .getElementById(ARRIVAL_FORM_SECTION_IDS[section])
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
