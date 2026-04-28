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
} from '@/domain/common/value-objects.ts';
import {
  type CategoryRecord,
  normalizeDirectoryName,
  type ProductRecord,
  type SupplierRecord,
} from '@/domain/directories';
import { nowIso } from '@/shared/utils/time.ts';

import type { DepartureRecord } from '../../departure.record.ts';
import type { CreateDepartureDirectoryInput } from '../create/create-departure.input.ts';
import type {
  CreateDepartureDirectoryResolveFailure,
  CreateDepartureDirectoryResolveFailureField,
  CreateDepartureDirectoryResolveFailureReason,
} from '../create/create-departure.result.ts';

export interface DepartureDirectoryRepositoryPort<TRecord> {
  getById(id: string): Promise<TRecord | undefined>;
  findByNormalizedName(normalizedName: string): Promise<TRecord | undefined>;
  put(record: TRecord): Promise<string>;
}

export interface DepartureDirectorySnapshot {
  id: string | null;
  name: string | null;
}

export interface BuildDepartureRecordInput {
  id: string;
  subjectKind: SubjectKind;
  title: string;
  description: string | null;
  occurredAt: string;
  money: MoneyValue;
  quantityCost: QuantityCostValue;
  note: string | null;
  direction: string | null;
  supplier: DepartureDirectorySnapshot;
  product: DepartureDirectorySnapshot;
  category: DepartureDirectorySnapshot;
  mode: DepartureRecord['mode'];
  basedOnArrivalId: string | null;
  originDraftId: string | null;
  originKind: RecordOriginKind;
  createdAt: string;
  updatedAt: string;
}

export async function resolveDepartureDirectory<TRecord>(
  field: CreateDepartureDirectoryResolveFailureField,
  repository: DepartureDirectoryRepositoryPort<TRecord>,
  input: CreateDepartureDirectoryInput,
  createRecord: (
    normalizedName: string,
    timestamp: string,
    directoryName: string
  ) => TRecord
): Promise<TRecord | CreateDepartureDirectoryResolveFailure | null> {
  if (input.id !== null) {
    const existing = await repository.getById(input.id);
    if (existing !== undefined) return existing;

    return createDepartureDirectoryResolveFailure(field, 'missing-id');
  }

  const normalizedName = normalizeDirectoryName(input.name);
  if (normalizedName === null || input.name === null) return null;

  const found = await repository.findByNormalizedName(normalizedName);
  if (found !== undefined) return found;

  if (!input.createIfMissing) {
    return createDepartureDirectoryResolveFailure(
      field,
      'creation-not-confirmed'
    );
  }

  const timestamp = nowIso();
  const created = createRecord(normalizedName, timestamp, input.name.trim());
  await repository.put(created);
  return created;
}

export function buildDepartureRecord(
  input: BuildDepartureRecordInput
): DepartureRecord {
  return {
    id: input.id,
    kind: 'departure',
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

    note: input.note,
    direction: input.direction,

    supplierId: input.supplier.id,
    supplierName: input.supplier.name,
    normalizedSupplierName: normalizeDirectoryName(input.supplier.name),

    productId: input.product.id,
    productName: input.product.name,
    normalizedProductName: normalizeDirectoryName(input.product.name),

    categoryId: input.category.id,
    categoryName: input.category.name,
    normalizedCategoryName: normalizeDirectoryName(input.category.name),

    mode: input.mode,
    basedOnArrivalId: input.basedOnArrivalId,

    originDraftId: input.originDraftId,
    originKind: input.originKind,

    createdAt: input.createdAt,
    updatedAt: input.updatedAt,
  };
}

export function createDepartureRecordCodes(
  ownerId: string,
  createdAt: string,
  codes: RecordCodeInput[]
): RecordCodeRecord[] {
  return createRecordCodeRecords('departure', ownerId, createdAt, codes);
}

export function createDepartureDirectoryResolveFailure(
  field: CreateDepartureDirectoryResolveFailureField,
  reason: CreateDepartureDirectoryResolveFailureReason
): CreateDepartureDirectoryResolveFailure {
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

export function isDepartureDirectoryResolveFailure(
  value:
    | SupplierRecord
    | CategoryRecord
    | ProductRecord
    | CreateDepartureDirectoryResolveFailure
    | null
): value is CreateDepartureDirectoryResolveFailure {
  return value !== null && 'ok' in value && value.ok === false;
}
