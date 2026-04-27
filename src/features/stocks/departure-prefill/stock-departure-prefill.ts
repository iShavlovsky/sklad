import type { SubjectKind } from '@/domain/common/record-kinds.ts';
import type { StockListItem } from '@/domain/queries/stock/stock-list.item.ts';

export interface StockDeparturePrefill {
  title: string;
  subjectKind: SubjectKind;
  supplierId: string;
  supplierName: string;
  productId: string;
  productName: string;
  categoryId: string;
  categoryName: string;
  amount: string;
  codes: string;
}

export interface StockDeparturePrefillState {
  stockDeparturePrefill?: StockDeparturePrefill;
}

export function buildStockDeparturePrefill(
  item: StockListItem
): StockDeparturePrefill {
  return {
    title: item.title,
    subjectKind: item.subjectKind,
    supplierId: item.supplierId ?? '',
    supplierName: item.supplierName ?? '',
    productId: item.productId ?? '',
    productName: item.productName ?? '',
    categoryId: item.categoryId ?? '',
    categoryName: item.categoryName ?? '',
    amount: item.balance > 0 ? String(item.balance) : '',
    codes: item.availableCodes.length === 1 ? item.availableCodes[0] : '',
  };
}
