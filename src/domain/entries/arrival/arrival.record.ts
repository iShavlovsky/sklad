import type {
  RecordOriginKind,
  SubjectKind,
} from '../../common/record-kinds.ts';

export interface ArrivalRecord {
  id: string;
  kind: 'arrival';
  subjectKind: SubjectKind;

  title: string;
  normalizedTitle: string;
  description: string | null;

  occurredAt: string;

  amount: number | null;
  currency: string | null;

  linkUrl: string | null;
  note: string | null;

  supplierId: string | null;
  supplierName: string | null;
  normalizedSupplierName: string | null;

  productId: string | null;
  productName: string | null;
  normalizedProductName: string | null;

  categoryId: string | null;
  categoryName: string | null;
  normalizedCategoryName: string | null;

  originDraftId: string | null;
  originKind: RecordOriginKind;

  createdAt: string;
  updatedAt: string;
}
