import {
  compareIsoDate,
  compareNullableString,
  containsNormalizedText,
  normalizeSearch,
  paginate,
} from '@/shared/utils/query';
import type { ProductRecord } from '@/domain/directories/product.record.ts';
import type {
  ProductListQuery,
  ProductListSort,
} from '@/domain/queries/directory/product-list.query.ts';
import type { ProductRepository } from '@/infrastructure/repositories/directories/product.repository.ts';

type ProductListFilterInput = ProductListQuery['filters'];

export class ProductQueries {
  private readonly repository: ProductRepository;

  public constructor(repository: ProductRepository) {
    this.repository = repository;
  }

  public async list(query: ProductListQuery): Promise<ProductRecord[]> {
    const rows = await this.repository.list();
    const normalizedSearch = normalizeSearch(query.filters.search);

    const filtered = rows
      .filter((row) =>
        this.matchesListFilters(row, query.filters, normalizedSearch)
      )
      .sort((left, right) => this.compareListItems(left, right, query.sort));

    return paginate(filtered, query.offset, query.limit);
  }

  private matchesListFilters(
    row: ProductRecord,
    filters: ProductListFilterInput,
    normalizedSearch: string
  ): boolean {
    if (filters.isArchived !== null && row.isArchived !== filters.isArchived) {
      return false;
    }

    if (filters.supplierId !== null && row.supplierId !== filters.supplierId) {
      return false;
    }

    if (filters.categoryId !== null && row.categoryId !== filters.categoryId) {
      return false;
    }

    return containsNormalizedText(
      [row.name, row.normalizedName, row.note, row.supplierId, row.categoryId],
      normalizedSearch
    );
  }

  private compareListItems(
    left: ProductRecord,
    right: ProductRecord,
    sort: ProductListSort
  ): number {
    let result = 0;

    switch (sort.field) {
      case 'name':
        result = compareNullableString(left.name, right.name, sort.direction);
        break;
      case 'createdAt':
        result = compareIsoDate(
          left.createdAt,
          right.createdAt,
          sort.direction
        );
        break;
      case 'updatedAt':
        result = compareIsoDate(
          left.updatedAt,
          right.updatedAt,
          sort.direction
        );
        break;
    }

    if (result !== 0) return result;

    return compareNullableString(left.id, right.id, 'asc');
  }
}
