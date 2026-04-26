import type { RecordCodeRecord } from '@/domain/codes/record-code.record.ts';
import type { CategoryRecord } from '@/domain/directories/category.record.ts';
import type { ProductRecord } from '@/domain/directories/product.record.ts';
import type { SupplierRecord } from '@/domain/directories/supplier.record.ts';

import type { ArrivalRecord } from '../../arrival/arrival.record.ts';
import type { DepartureRecord } from '../../departure.record.ts';

export interface DepartureCreateRepositoryPort {
  put(record: DepartureRecord): Promise<string>;
}

export interface DepartureCreateSupplierRepositoryPort {
  getById(id: string): Promise<SupplierRecord | undefined>;
  findByNormalizedName(
    normalizedName: string
  ): Promise<SupplierRecord | undefined>;
  put(record: SupplierRecord): Promise<string>;
}

export interface DepartureCreateCategoryRepositoryPort {
  getById(id: string): Promise<CategoryRecord | undefined>;
  findByNormalizedName(
    normalizedName: string
  ): Promise<CategoryRecord | undefined>;
  put(record: CategoryRecord): Promise<string>;
}

export interface DepartureCreateProductRepositoryPort {
  getById(id: string): Promise<ProductRecord | undefined>;
  findByNormalizedName(
    normalizedName: string
  ): Promise<ProductRecord | undefined>;
  put(record: ProductRecord): Promise<string>;
}

export interface DepartureCreateArrivalRepositoryPort {
  getById(id: string): Promise<ArrivalRecord | undefined>;
}

export interface DepartureCreateRecordCodeRepositoryPort {
  replaceOwnerCodes(
    ownerKind: 'departure',
    ownerId: string,
    records: RecordCodeRecord[]
  ): Promise<void>;
}

export interface CreateDepartureDependencies {
  departureRepository: DepartureCreateRepositoryPort;
  arrivalRepository: DepartureCreateArrivalRepositoryPort;
  supplierRepository: DepartureCreateSupplierRepositoryPort;
  categoryRepository: DepartureCreateCategoryRepositoryPort;
  productRepository: DepartureCreateProductRepositoryPort;
  recordCodeRepository: DepartureCreateRecordCodeRepositoryPort;
}
