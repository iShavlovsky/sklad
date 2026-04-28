import type {
  RecordOriginKind,
  SubjectKind,
} from '@/domain/common/record-kinds.ts';

export interface ArrivalListItem {
  id: string;
  kind: 'arrival';
  subjectKind: SubjectKind;

  title: string;
  description: string | null;
  occurredAt: string;

  amount: number | null;
  currency: string | null;
  quantity: number | null;
  totalCost: number | null;
  unitCost: number | null;

  linkUrl: string | null;
  note: string | null;

  supplierId: string | null;
  supplierName: string | null;

  productId: string | null;
  productName: string | null;

  categoryId: string | null;
  categoryName: string | null;

  originDraftId: string | null;
  originKind: RecordOriginKind;

  createdAt: string;
  updatedAt: string;

  hasCodes: boolean;
}
