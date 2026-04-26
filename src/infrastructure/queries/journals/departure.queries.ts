import type { RecordCodeRecord } from '@/domain/codes/record-code.record.ts';
import {
  compareIsoDate,
  compareNullableNumber,
  compareNullableString,
  containsNormalizedText,
  matchesDateRange,
  normalizeSearch,
  paginate,
} from '@/domain/common/query-helpers';
import type { DepartureRecord } from '@/domain/entries/departure.record.ts';
import type {
  DepartureDetails,
  DepartureDetailsCodeItem,
  DepartureDetailsQuery,
} from '@/domain/queries/departure/departure-details.query.ts';
import type { DepartureListItem } from '@/domain/queries/departure/departure-list.item.ts';
import type {
  DepartureListQuery,
  DepartureListSort,
} from '@/domain/queries/departure/departure-list.query.ts';
import type { AppDb } from '@/infrastructure/db/app-db';

type DepartureListFilterInput = DepartureListQuery['filters'];

export class DepartureQueries {
  private readonly db: AppDb;

  public constructor(db: AppDb) {
    this.db = db;
  }

  public async list(query: DepartureListQuery): Promise<DepartureListItem[]> {
    const [rows, codes] = await Promise.all([
      this.db.departures.toArray(),
      this.db.recordCodes.where('ownerKind').equals('departure').toArray(),
    ]);

    const rowsWithCodes = this.projectListItems(rows, codes);
    const normalizedSearch = normalizeSearch(query.filters.search);

    const filtered = rowsWithCodes
      .filter((row) =>
        this.matchesListFilters(row, query.filters, normalizedSearch)
      )
      .sort((left, right) => this.compareListItems(left, right, query.sort));

    return paginate(filtered, query.offset, query.limit);
  }

  public async details(
    query: DepartureDetailsQuery
  ): Promise<DepartureDetails | null> {
    const departure = await this.db.departures.get(query.id);
    if (departure === undefined) return null;

    const codes = await this.db.recordCodes
      .where('[ownerKind+ownerId]')
      .equals(['departure', query.id])
      .toArray();

    return {
      departure,
      codes: this.projectDepartureCodes(codes),
    };
  }

  private projectListItems(
    rows: DepartureRecord[],
    codes: RecordCodeRecord[]
  ): DepartureListItem[] {
    const departureIdsWithCodes = new Set(codes.map((code) => code.ownerId));

    return rows.map((row) => ({
      id: row.id,
      kind: row.kind,
      subjectKind: row.subjectKind,
      title: row.title,
      description: row.description,
      occurredAt: row.occurredAt,
      amount: row.amount,
      currency: row.currency,
      note: row.note,
      direction: row.direction,
      supplierId: row.supplierId,
      supplierName: row.supplierName,
      productId: row.productId,
      productName: row.productName,
      categoryId: row.categoryId,
      categoryName: row.categoryName,
      mode: row.mode,
      basedOnArrivalId: row.basedOnArrivalId,
      originDraftId: row.originDraftId,
      originKind: row.originKind,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      hasCodes: departureIdsWithCodes.has(row.id),
    }));
  }

  private projectDepartureCodes(
    codes: RecordCodeRecord[]
  ): DepartureDetailsCodeItem[] {
    return codes.map((code) => ({
      id: code.id,
      kind: code.kind,
      value: code.value,
    }));
  }

  private matchesListFilters(
    row: DepartureListItem,
    filters: DepartureListFilterInput,
    normalizedSearch: string
  ): boolean {
    if (
      filters.subjectKind !== null &&
      row.subjectKind !== filters.subjectKind
    ) {
      return false;
    }

    if (filters.supplierId !== null && row.supplierId !== filters.supplierId) {
      return false;
    }

    if (filters.productId !== null && row.productId !== filters.productId) {
      return false;
    }

    if (filters.categoryId !== null && row.categoryId !== filters.categoryId) {
      return false;
    }

    if (filters.originKind !== null && row.originKind !== filters.originKind) {
      return false;
    }

    if (filters.mode !== null && row.mode !== filters.mode) {
      return false;
    }

    if (
      filters.basedOnArrivalId !== null &&
      row.basedOnArrivalId !== filters.basedOnArrivalId
    ) {
      return false;
    }

    if (filters.hasCodes !== null && row.hasCodes !== filters.hasCodes) {
      return false;
    }

    if (
      !containsNormalizedText(
        [
          row.title,
          row.supplierName,
          row.productName,
          row.categoryName,
          row.description,
          row.note,
          row.direction,
        ],
        normalizedSearch
      )
    ) {
      return false;
    }

    if (!matchesDateRange(row.occurredAt, filters.occurredAt)) {
      return false;
    }

    if (!matchesDateRange(row.createdAt, filters.createdAt)) {
      return false;
    }

    return true;
  }

  private compareListItems(
    left: DepartureListItem,
    right: DepartureListItem,
    sort: DepartureListSort
  ): number {
    let result = 0;

    switch (sort.field) {
      case 'occurredAt':
        result = compareIsoDate(
          left.occurredAt,
          right.occurredAt,
          sort.direction
        );
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
      case 'title':
        result = compareNullableString(left.title, right.title, sort.direction);
        break;
      case 'supplierName':
        result = compareNullableString(
          left.supplierName,
          right.supplierName,
          sort.direction
        );
        break;
      case 'productName':
        result = compareNullableString(
          left.productName,
          right.productName,
          sort.direction
        );
        break;
      case 'categoryName':
        result = compareNullableString(
          left.categoryName,
          right.categoryName,
          sort.direction
        );
        break;
      case 'amount':
        result = compareNullableNumber(
          left.amount,
          right.amount,
          sort.direction
        );
        break;
    }

    if (result !== 0) return result;

    return compareNullableString(left.id, right.id, 'asc');
  }
}
