import type {
  RecordCodeKind,
  SubjectKind,
} from '@/domain/common/record-kinds.ts';

export type ArrivalEditorMode = 'create' | 'edit';

export interface ArrivalEditorDirectoryValue {
  createIfMissing: boolean;
  id: string;
  name: string;
}

export interface ArrivalEditorFormValues {
  amount: string;
  category: ArrivalEditorDirectoryValue;
  codeKind: RecordCodeKind;
  codes: string;
  currency: string;
  description: string;
  linkUrl: string;
  note: string;
  occurredAt: string;
  product: ArrivalEditorDirectoryValue;
  quantity: string;
  subjectKind: SubjectKind;
  supplier: ArrivalEditorDirectoryValue;
  title: string;
  totalCost: string;
  unitCost: string;
}

export type ArrivalEditorSectionName = 'additional' | 'directories' | 'main';
