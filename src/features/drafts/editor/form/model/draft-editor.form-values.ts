import type {
  DepartureMode,
  RecordCodeKind,
  RecordKind,
  SubjectKind,
} from '@/domain/common/record-kinds.ts';

export type DraftEditorMode = 'create' | 'edit';

export interface DraftEditorFormValues {
  amount: string;
  basedOnArrivalId: string;
  categoryId: string;
  categoryName: string;
  codeKind: RecordCodeKind;
  codes: string;
  currency: string;
  departureMode: DepartureMode;
  description: string;
  direction: string;
  kind: RecordKind;
  linkUrl: string;
  note: string;
  occurredAt: string;
  productId: string;
  productName: string;
  subjectKind: SubjectKind;
  supplierId: string;
  supplierName: string;
  title: string;
}

export type DraftEditorSectionName =
  | 'additional'
  | 'directories'
  | 'main'
  | 'publishMeta'
  | 'relation';
