import type {
  DepartureMode,
  RecordCodeKind,
  RecordKind,
  SubjectKind,
} from '@/domain/common/record-kinds.ts';

export type DraftEditorMode = 'create' | 'edit';

export interface DraftEditorFormValues {
  kind: RecordKind;
  title: string;
  subjectKind: SubjectKind;
  description: string;
  occurredAt: string;
  amount: string;
  currency: string;
  supplierId: string;
  supplierName: string;
  productId: string;
  productName: string;
  categoryId: string;
  categoryName: string;
  codeKind: RecordCodeKind;
  codes: string;
  linkUrl: string;
  note: string;
  direction: string;
  departureMode: DepartureMode;
  basedOnArrivalId: string;
}

export type DraftEditorSectionName =
  | 'kind'
  | 'basic'
  | 'directories'
  | 'codes'
  | 'additional'
  | 'link';
