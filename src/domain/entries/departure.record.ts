import type {
  DepartureMode,
  RecordOriginKind,
  SubjectKind,
} from '../common/record-kinds.ts';

export interface DepartureRecord {
  id: string;
  kind: 'departure';
  subjectKind: SubjectKind;

  title: string;
  normalizedTitle: string;
  description: string | null;

  occurredAt: string;

  amount: number | null;
  currency: string | null;

  note: string | null;
  direction: string | null;

  supplierId: string | null;
  supplierName: string | null;
  normalizedSupplierName: string | null;

  productId: string | null;
  productName: string | null;
  normalizedProductName: string | null;

  categoryId: string | null;
  categoryName: string | null;
  normalizedCategoryName: string | null;

  mode: DepartureMode;
  basedOnArrivalId: string | null;

  originDraftId: string | null;
  originKind: RecordOriginKind;

  createdAt: string;
  updatedAt: string;
}
