import { useState } from 'react';

import { DEPARTURE_FORM_SECTION_IDS } from './departure-editor.form-constants.ts';
import type { DepartureEditorSectionName } from './departure-editor.form-values.ts';

export function useDepartureSectionNavigation() {
  const [openedSections, setOpenedSections] = useState<Array<string>>([]);

  function resolveErrorSection(
    errors: Record<string, unknown>
  ): DepartureEditorSectionName {
    if (errors.note || errors.direction || errors.description) {
      return 'additional';
    }

    if (
      errors['supplier.name'] ||
      errors['product.name'] ||
      errors['category.name']
    ) {
      return 'directories';
    }

    if (errors.basedOnArrivalId) {
      return 'relation';
    }

    return 'main';
  }

  function ensureSectionOpen(section: DepartureEditorSectionName): void {
    if (section === 'main') {
      return;
    }

    setOpenedSections((currentSections) =>
      currentSections.includes(section)
        ? currentSections
        : [...currentSections, section]
    );
  }

  function scrollToSection(section: DepartureEditorSectionName): void {
    ensureSectionOpen(section);

    requestAnimationFrame(() => {
      document
        .getElementById(DEPARTURE_FORM_SECTION_IDS[section])
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
