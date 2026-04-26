import type { ReactElement } from 'react';

import type { ArrivalDetails } from '@/domain/queries/arrival/arrival-details.query.ts';
import { DepartureRelationSection } from '@/features/departure-editor/form/sections/relation-section';

interface DraftRelationSectionProps {
  arrivalOptions: Array<{ label: string; value: string }>;
  linkedArrival: ArrivalDetails | null | undefined;
  onApplyLinkedArrival: () => void;
  onClearLinkedArrival: () => void;
  onSearchChange: (value: string) => void;
  onSelectedArrivalChange: (value: string) => void;
  selectedArrivalId: string;
}

export function DraftRelationSection(
  props: Readonly<DraftRelationSectionProps>
): ReactElement {
  return <DepartureRelationSection {...props} />;
}
