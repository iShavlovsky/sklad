import type { RecordCodeRecord } from '@/domain/codes/record-code.record.ts';
import type { CategoryRecord } from '@/domain/directories/category.record.ts';
import type { ProductRecord } from '@/domain/directories/product.record.ts';
import type { SupplierRecord } from '@/domain/directories/supplier.record.ts';

import type { ArrivalRecord } from '../arrival.record.ts';

export interface ArrivalCreateRepositoryPort {
  put(record: ArrivalRecord): Promise<string>;
}

export interface ArrivalCreateSupplierRepositoryPort {
  getById(id: string): Promise<SupplierRecord | undefined>;
  findByNormalizedName(
    normalizedName: string
  ): Promise<SupplierRecord | undefined>;
  put(record: SupplierRecord): Promise<string>;
}

export interface ArrivalCreateCategoryRepositoryPort {
  getById(id: string): Promise<CategoryRecord | undefined>;
  findByNormalizedName(
    normalizedName: string
  ): Promise<CategoryRecord | undefined>;
  put(record: CategoryRecord): Promise<string>;
}

export interface ArrivalCreateProductRepositoryPort {
  getById(id: string): Promise<ProductRecord | undefined>;
  findByNormalizedName(
    normalizedName: string
  ): Promise<ProductRecord | undefined>;
  put(record: ProductRecord): Promise<string>;
}

export interface ArrivalCreateRecordCodeRepositoryPort {
  findByNormalizedValue(normalizedValue: string): Promise<RecordCodeRecord[]>;
  replaceOwnerCodes(
    ownerKind: 'arrival',
    ownerId: string,
    records: RecordCodeRecord[]
  ): Promise<void>;
}

export interface CreateArrivalDependencies {
  arrivalRepository: ArrivalCreateRepositoryPort;
  supplierRepository: ArrivalCreateSupplierRepositoryPort;
  categoryRepository: ArrivalCreateCategoryRepositoryPort;
  productRepository: ArrivalCreateProductRepositoryPort;
  recordCodeRepository: ArrivalCreateRecordCodeRepositoryPort;
}
