import type { RecordCodeRecord } from '@/domain/codes/record-code.record.ts';
import {
  compareIsoDate,
  compareNullableString,
  containsNormalizedText,
  normalizeSearch,
  paginate,
} from '@/shared/utils/query';
import type {
  RecordCodeDetails,
  RecordCodeDetailsQuery,
  RecordCodeListItem,
  RecordCodeListQuery,
  RecordCodeLookupQuery,
  RecordCodeLookupResult,
} from '@/domain/queries/record-code';
import type { AppDb } from '@/infrastructure/db/app-db';

type RecordCodeListFilterInput = RecordCodeListQuery['filters'];

export class RecordCodeQueries {
  private readonly db: AppDb;

  public constructor(db: AppDb) {
    this.db = db;
  }

  public async list(query: RecordCodeListQuery): Promise<RecordCodeListItem[]> {
    const rows = await this.db.recordCodes.toArray();
    const normalizedSearch = normalizeSearch(query.filters.search);

    const filtered = rows
      .filter((row) =>
        this.matchesListFilters(row, query.filters, normalizedSearch)
      )
      .sort((left, right) => this.compareListItems(left, right, query));

    return paginate(filtered, query.offset, query.limit);
  }

  public async details(
    query: RecordCodeDetailsQuery
  ): Promise<RecordCodeDetails | null> {
    const recordCode = await this.db.recordCodes.get(query.id);
    if (recordCode === undefined) {
      return null;
    }

    return { recordCode };
  }

  public async lookup(
    query: RecordCodeLookupQuery
  ): Promise<RecordCodeLookupResult> {
    const matches = await this.db.recordCodes
      .where('normalizedValue')
      .equals(query.normalizedValue)
      .toArray();

    return {
      normalizedValue: query.normalizedValue,
      matches,
    };
  }

  private matchesListFilters(
    row: RecordCodeRecord,
    filters: RecordCodeListFilterInput,
    normalizedSearch: string
  ): boolean {
    if (filters.ownerKind !== null && row.ownerKind !== filters.ownerKind) {
      return false;
    }

    if (filters.ownerId !== null && row.ownerId !== filters.ownerId) {
      return false;
    }

    if (filters.kind !== null && row.kind !== filters.kind) {
      return false;
    }

    if (
      !containsNormalizedText(
        [row.value, row.normalizedValue, row.ownerKind, row.ownerId, row.kind],
        normalizedSearch
      )
    ) {
      return false;
    }

    return true;
  }

  private compareListItems(
    left: RecordCodeRecord,
    right: RecordCodeRecord,
    query: RecordCodeListQuery
  ): number {
    let result = 0;

    switch (query.sort.field) {
      case 'value':
        result = compareNullableString(
          left.value,
          right.value,
          query.sort.direction
        );
        break;
      case 'createdAt':
        result = compareIsoDate(
          left.createdAt,
          right.createdAt,
          query.sort.direction
        );
        break;
    }

    if (result !== 0) {
      return result;
    }

    return compareNullableString(left.id, right.id, 'asc');
  }
}
