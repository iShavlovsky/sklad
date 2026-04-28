import type {
  DepartureMode,
  RecordOriginKind,
  SubjectKind,
} from '@/domain/common/record-kinds.ts';

export interface DepartureListItem {
  id: string;
  kind: 'departure';
  subjectKind: SubjectKind;

  title: string;
  description: string | null;
  occurredAt: string;

  amount: number | null;
  currency: string | null;
  quantity: number | null;
  totalCost: number | null;
  unitCost: number | null;

  note: string | null;
  direction: string | null;

  supplierId: string | null;
  supplierName: string | null;

  productId: string | null;
  productName: string | null;

  categoryId: string | null;
  categoryName: string | null;

  mode: DepartureMode;
  basedOnArrivalId: string | null;

  originDraftId: string | null;
  originKind: RecordOriginKind;

  createdAt: string;
  updatedAt: string;

  hasCodes: boolean;
}
