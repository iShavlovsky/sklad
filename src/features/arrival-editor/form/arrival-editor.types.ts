import type {
  RecordCodeKind,
  SubjectKind,
} from '../../../domain/common/record-kinds.ts';

export type ArrivalEditorMode = 'create' | 'edit';

export interface ArrivalEditorDirectoryValue {
  id: string;
  name: string;
  createIfMissing: boolean;
}

export interface ArrivalEditorFormValues {
  title: string;
  subjectKind: SubjectKind;
  description: string;
  occurredAt: string;
  amount: string;
  currency: string;
  linkUrl: string;
  note: string;
  supplier: ArrivalEditorDirectoryValue;
  product: ArrivalEditorDirectoryValue;
  category: ArrivalEditorDirectoryValue;
  codes: string;
  codeKind: RecordCodeKind;
}

export interface ArrivalEditorFieldErrors {
  title?: string;
  occurredAt?: string;
  amount?: string;
}
