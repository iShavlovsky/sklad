import {
  compareIsoDate,
  compareNullableString,
  containsNormalizedText,
  normalizeSearch,
  paginate,
} from '@/shared/utils/query';
import type { CategoryRecord } from '@/domain/directories/category.record.ts';
import type {
  CategoryListQuery,
  CategoryListSort,
} from '@/domain/queries/directory/category-list.query.ts';
import type { CategoryRepository } from '@/infrastructure/repositories/directories/category.repository.ts';

type CategoryListFilterInput = CategoryListQuery['filters'];

export class CategoryQueries {
  private readonly repository: CategoryRepository;

  public constructor(repository: CategoryRepository) {
    this.repository = repository;
  }

  public async list(query: CategoryListQuery): Promise<CategoryRecord[]> {
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
    row: CategoryRecord,
    filters: CategoryListFilterInput,
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
    left: CategoryRecord,
    right: CategoryRecord,
    sort: CategoryListSort
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
