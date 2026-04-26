import type { RecordCodeRecord } from '@/domain/codes/record-code.record.ts';
import type { CategoryRecord } from '@/domain/directories/category.record.ts';
import type { ProductRecord } from '@/domain/directories/product.record.ts';
import type { SupplierRecord } from '@/domain/directories/supplier.record.ts';

import type { ArrivalRecord } from '../../arrival/arrival.record.ts';
import type { DepartureRecord } from '../../departure.record.ts';

export interface DepartureUpdateRepositoryPort {
  getById(id: string): Promise<DepartureRecord | undefined>;
  put(record: DepartureRecord): Promise<string>;
}

export interface DepartureUpdateSupplierRepositoryPort {
  getById(id: string): Promise<SupplierRecord | undefined>;
  findByNormalizedName(
    normalizedName: string
  ): Promise<SupplierRecord | undefined>;
  put(record: SupplierRecord): Promise<string>;
}

export interface DepartureUpdateCategoryRepositoryPort {
  getById(id: string): Promise<CategoryRecord | undefined>;
  findByNormalizedName(
    normalizedName: string
  ): Promise<CategoryRecord | undefined>;
  put(record: CategoryRecord): Promise<string>;
}

export interface DepartureUpdateProductRepositoryPort {
  getById(id: string): Promise<ProductRecord | undefined>;
  findByNormalizedName(
    normalizedName: string
  ): Promise<ProductRecord | undefined>;
  put(record: ProductRecord): Promise<string>;
}

export interface DepartureUpdateArrivalRepositoryPort {
  getById(id: string): Promise<ArrivalRecord | undefined>;
}

export interface DepartureUpdateRecordCodeRepositoryPort {
  replaceOwnerCodes(
    ownerKind: 'departure',
    ownerId: string,
    records: RecordCodeRecord[]
  ): Promise<void>;
}

export interface UpdateDepartureDependencies {
  departureRepository: DepartureUpdateRepositoryPort;
  arrivalRepository: DepartureUpdateArrivalRepositoryPort;
  supplierRepository: DepartureUpdateSupplierRepositoryPort;
  categoryRepository: DepartureUpdateCategoryRepositoryPort;
  productRepository: DepartureUpdateProductRepositoryPort;
  recordCodeRepository: DepartureUpdateRecordCodeRepositoryPort;
}
