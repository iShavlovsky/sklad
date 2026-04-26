import type {
  DepartureMode,
  RecordCodeKind,
  SubjectKind,
} from '../../../domain/common/record-kinds.ts';

export interface DepartureEditorDirectoryValue {
  id: string;
  name: string;
  createIfMissing: boolean;
}

export interface DepartureEditorFormValues {
  title: string;
  subjectKind: SubjectKind;
  description: string;
  occurredAt: string;
  amount: string;
  currency: string;
  note: string;
  direction: string;
  supplier: DepartureEditorDirectoryValue;
  product: DepartureEditorDirectoryValue;
  category: DepartureEditorDirectoryValue;
  mode: DepartureMode;
  basedOnArrivalId: string;
  codes: string;
  codeKind: RecordCodeKind;
}
