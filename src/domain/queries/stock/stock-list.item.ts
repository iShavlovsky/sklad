import type { SubjectKind } from '@/domain/common/record-kinds.ts';

export interface StockListItem {
  id: string;
  title: string;
  subjectKind: SubjectKind;

  supplierId: string | null;
  supplierName: string | null;

  productId: string | null;
  productName: string | null;

  categoryId: string | null;
  categoryName: string | null;

  arrivalCount: number;
  departureCount: number;
  balance: number;
  availableCodes: string[];
  updatedAt: string;
}
