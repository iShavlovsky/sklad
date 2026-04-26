import type { RecordCodeRecord } from '@/domain/codes/record-code.record.ts';
import type { CategoryRecord } from '@/domain/directories/category.record.ts';
import type { ProductRecord } from '@/domain/directories/product.record.ts';
import type { SupplierRecord } from '@/domain/directories/supplier.record.ts';

import type { ArrivalRecord } from '../arrival.record.ts';

export interface ArrivalUpdateRepositoryPort {
  getById(id: string): Promise<ArrivalRecord | undefined>;
  put(record: ArrivalRecord): Promise<string>;
}

export interface ArrivalUpdateSupplierRepositoryPort {
  getById(id: string): Promise<SupplierRecord | undefined>;
  findByNormalizedName(
    normalizedName: string
  ): Promise<SupplierRecord | undefined>;
  put(record: SupplierRecord): Promise<string>;
}

export interface ArrivalUpdateCategoryRepositoryPort {
  getById(id: string): Promise<CategoryRecord | undefined>;
  findByNormalizedName(
    normalizedName: string
  ): Promise<CategoryRecord | undefined>;
  put(record: CategoryRecord): Promise<string>;
}

export interface ArrivalUpdateProductRepositoryPort {
  getById(id: string): Promise<ProductRecord | undefined>;
  findByNormalizedName(
    normalizedName: string
  ): Promise<ProductRecord | undefined>;
  put(record: ProductRecord): Promise<string>;
}

export interface ArrivalUpdateRecordCodeRepositoryPort {
  replaceOwnerCodes(
    ownerKind: 'arrival',
    ownerId: string,
    records: RecordCodeRecord[]
  ): Promise<void>;
}

export interface UpdateArrivalDependencies {
  arrivalRepository: ArrivalUpdateRepositoryPort;
  supplierRepository: ArrivalUpdateSupplierRepositoryPort;
  categoryRepository: ArrivalUpdateCategoryRepositoryPort;
  productRepository: ArrivalUpdateProductRepositoryPort;
  recordCodeRepository: ArrivalUpdateRecordCodeRepositoryPort;
}
