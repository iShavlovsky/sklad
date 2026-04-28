import type {
  DepartureMode,
  RecordCodeKind,
  SubjectKind,
} from '@/domain/common/record-kinds.ts';

export interface DepartureEditorDirectoryValue {
  createIfMissing: boolean;
  id: string;
  name: string;
}

export interface DepartureEditorFormValues {
  amount: string;
  basedOnArrivalId: string;
  category: DepartureEditorDirectoryValue;
  codeKind: RecordCodeKind;
  codes: string;
  currency: string;
  description: string;
  direction: string;
  mode: DepartureMode;
  note: string;
  occurredAt: string;
  product: DepartureEditorDirectoryValue;
  quantity: string;
  subjectKind: SubjectKind;
  supplier: DepartureEditorDirectoryValue;
  title: string;
  totalCost: string;
  unitCost: string;
}

export type DepartureEditorSectionName =
  | 'additional'
  | 'directories'
  | 'main'
  | 'relation';
