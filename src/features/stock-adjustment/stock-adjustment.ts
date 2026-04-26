import type { CreateArrivalInput } from '@/domain/entries/arrival/create/create-arrival.input.ts';
import type { CreateDepartureInput } from '@/domain/entries/departure/create/create-departure.input.ts';
import type { StockListItem } from '@/domain/queries/stock/stock-list.item.ts';
import { nowIso } from '@/shared/utils/time.ts';

function buildDirectoryInput(id: string | null, name: string | null) {
  return {
    id,
    name,
    createIfMissing: false,
  };
}

function normalizeAdjustmentReason(reason: string): string | null {
  const trimmed = reason.trim();
  return trimmed === '' ? null : trimmed;
}

export function buildStockIncreaseAdjustmentInput(
  item: StockListItem,
  amount: number,
  reason: string
): CreateArrivalInput {
  return {
    title: item.title,
    subjectKind: item.subjectKind,
    description: 'Корректировка остатка',
    occurredAt: nowIso(),
    money: {
      amount,
      currency: null,
    },
    linkUrl: null,
    note: normalizeAdjustmentReason(reason),
    supplier: buildDirectoryInput(item.supplierId, item.supplierName),
    product: buildDirectoryInput(item.productId, item.productName),
    category: buildDirectoryInput(item.categoryId, item.categoryName),
    codes: [],
    originDraftId: null,
  };
}

export function buildStockDecreaseAdjustmentInput(
  item: StockListItem,
  amount: number,
  reason: string
): CreateDepartureInput {
  return {
    title: item.title,
    subjectKind: item.subjectKind,
    description: 'Корректировка остатка',
    occurredAt: nowIso(),
    money: {
      amount,
      currency: null,
    },
    note: normalizeAdjustmentReason(reason),
    direction: 'adjustment',
    supplier: buildDirectoryInput(item.supplierId, item.supplierName),
    product: buildDirectoryInput(item.productId, item.productName),
    category: buildDirectoryInput(item.categoryId, item.categoryName),
    mode: 'loss',
    basedOnArrivalId: null,
    codes: [],
    originDraftId: null,
  };
}
