import {
  compareIsoDate,
  compareNullableString,
  containsNormalizedText,
  normalizeSearch,
  paginate,
} from '@/domain/common/query-helpers';
import type { SupplierRecord } from '@/domain/directories/supplier.record.ts';
import type {
  SupplierListQuery,
  SupplierListSort,
} from '@/domain/queries/directory/supplier-list.query.ts';
import type { SupplierRepository } from '@/infrastructure/repositories/directories/supplier.repository.ts';

type SupplierListFilterInput = SupplierListQuery['filters'];

export class SupplierQueries {
  private readonly repository: SupplierRepository;

  public constructor(repository: SupplierRepository) {
    this.repository = repository;
  }

  public async list(query: SupplierListQuery): Promise<SupplierRecord[]> {
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
    row: SupplierRecord,
    filters: SupplierListFilterInput,
    normalizedSearch: string
  ): boolean {
    if (filters.isArchived !== null && row.isArchived !== filters.isArchived) {
      return false;
    }

    return containsNormalizedText(
      [row.name, row.normalizedName, row.note],
      normalizedSearch
    );
  }

  private compareListItems(
    left: SupplierRecord,
    right: SupplierRecord,
    sort: SupplierListSort
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
