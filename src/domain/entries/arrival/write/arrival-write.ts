import {
  createRecordCodeRecords,
  type RecordCodeInput,
  type RecordCodeRecord,
} from '@/domain/codes';
import type {
  RecordOriginKind,
  SubjectKind,
} from '@/domain/common/record-kinds.ts';
import type {
  MoneyValue,
  QuantityCostValue,
} from '@/domain/common/value-objects';
import {
  type CategoryRecord,
  normalizeDirectoryName,
  type ProductRecord,
  type SupplierRecord,
} from '@/domain/directories';
import { nowIso } from '@/shared/utils/time.ts';

import type { ArrivalRecord } from '../arrival.record.ts';
import type { CreateArrivalDirectoryInput } from '../create/create-arrival.input.ts';
import type {
  CreateArrivalDirectoryResolveFailure,
  CreateArrivalDirectoryResolveFailureField,
  CreateArrivalDirectoryResolveFailureReason,
} from '../create/create-arrival.result.ts';

export interface ArrivalDirectoryRepositoryPort<TRecord> {
  getById(id: string): Promise<TRecord | undefined>;
  findByNormalizedName(normalizedName: string): Promise<TRecord | undefined>;
  put(record: TRecord): Promise<string>;
}

export interface ArrivalDirectorySnapshot {
  id: string | null;
  name: string | null;
}

export interface BuildArrivalRecordInput {
  id: string;
  subjectKind: SubjectKind;
  title: string;
  description: string | null;
  occurredAt: string;
  money: MoneyValue;
  quantityCost: QuantityCostValue;
  linkUrl: string | null;
  note: string | null;
  supplier: ArrivalDirectorySnapshot;
  product: ArrivalDirectorySnapshot;
  category: ArrivalDirectorySnapshot;
  originDraftId: string | null;
  originKind: RecordOriginKind;
  createdAt: string;
  updatedAt: string;
}

export async function resolveArrivalDirectory<TRecord>(
  field: CreateArrivalDirectoryResolveFailureField,
  repository: ArrivalDirectoryRepositoryPort<TRecord>,
  input: CreateArrivalDirectoryInput,
  createRecord: (
    normalizedName: string,
    timestamp: string,
    directoryName: string
  ) => TRecord
): Promise<TRecord | CreateArrivalDirectoryResolveFailure | null> {
  if (input.id !== null) {
    const existing = await repository.getById(input.id);
    if (existing !== undefined) return existing;

    return createArrivalDirectoryResolveFailure(field, 'missing-id');
  }

  const normalizedName = normalizeDirectoryName(input.name);
  if (normalizedName === null || input.name === null) return null;

  const found = await repository.findByNormalizedName(normalizedName);
  if (found !== undefined) return found;

  if (!input.createIfMissing) {
    return createArrivalDirectoryResolveFailure(
      field,
      'creation-not-confirmed'
    );
  }

  const timestamp = nowIso();
  const created = createRecord(normalizedName, timestamp, input.name.trim());
  await repository.put(created);
  return created;
}

export function buildArrivalRecord(
  input: BuildArrivalRecordInput
): ArrivalRecord {
  return {
    id: input.id,
    kind: 'arrival',
    subjectKind: input.subjectKind,

    title: input.title.trim(),
    normalizedTitle: input.title.trim().toLowerCase(),
    description: input.description,

    occurredAt: input.occurredAt,

    amount: input.money.amount,
    currency: input.money.currency,
    quantity: input.quantityCost.quantity,
    totalCost: input.quantityCost.totalCost,
    unitCost: input.quantityCost.unitCost,

    linkUrl: input.linkUrl,
    note: input.note,

    supplierId: input.supplier.id,
    supplierName: input.supplier.name,
    normalizedSupplierName: normalizeDirectoryName(input.supplier.name),

    productId: input.product.id,
    productName: input.product.name,
    normalizedProductName: normalizeDirectoryName(input.product.name),

    categoryId: input.category.id,
    categoryName: input.category.name,
    normalizedCategoryName: normalizeDirectoryName(input.category.name),

    originDraftId: input.originDraftId,
    originKind: input.originKind,

    createdAt: input.createdAt,
    updatedAt: input.updatedAt,
  };
}

export function createArrivalRecordCodes(
  ownerId: string,
  createdAt: string,
  codes: RecordCodeInput[]
): RecordCodeRecord[] {
  return createRecordCodeRecords('arrival', ownerId, createdAt, codes);
}

export function createArrivalDirectoryResolveFailure(
  field: CreateArrivalDirectoryResolveFailureField,
  reason: CreateArrivalDirectoryResolveFailureReason
): CreateArrivalDirectoryResolveFailure {
  const codeMap = {
    supplier: 'SUPPLIER_RESOLVE_FAILED',
    product: 'PRODUCT_RESOLVE_FAILED',
    category: 'CATEGORY_RESOLVE_FAILED',
  } as const;

  return {
    ok: false,
    code: codeMap[field],
    field,
    reason,
  };
}

export function isArrivalDirectoryResolveFailure(
  value:
    | SupplierRecord
    | CategoryRecord
    | ProductRecord
    | CreateArrivalDirectoryResolveFailure
    | null
): value is CreateArrivalDirectoryResolveFailure {
  return value !== null && 'ok' in value && value.ok === false;
}
