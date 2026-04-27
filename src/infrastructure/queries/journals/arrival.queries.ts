import type { RecordCodeRecord } from '@/domain/codes/record-code.record.ts';
import {
  compareIsoDate,
  compareNullableNumber,
  compareNullableString,
  containsNormalizedText,
  matchesDateRange,
  normalizeSearch,
  paginate,
} from '@/shared/utils/query';
import type { ArrivalRecord } from '@/domain/entries/arrival/arrival.record.ts';
import type {
  ArrivalDetails,
  ArrivalDetailsCodeItem,
  ArrivalDetailsQuery,
} from '@/domain/queries/arrival/arrival-details.query.ts';
import type { ArrivalListItem } from '@/domain/queries/arrival/arrival-list.item.ts';
import type {
  ArrivalListQuery,
  ArrivalListSort,
} from '@/domain/queries/arrival/arrival-list.query.ts';
import type { AppDb } from '@/infrastructure/db/app-db';

type ArrivalListFilterInput = ArrivalListQuery['filters'];

export class ArrivalQueries {
  private readonly db: AppDb;

  public constructor(db: AppDb) {
    this.db = db;
  }

  public async list(query: ArrivalListQuery): Promise<ArrivalListItem[]> {
    const [rows, codes] = await Promise.all([
      this.db.arrivals.toArray(),
      this.db.recordCodes.where('ownerKind').equals('arrival').toArray(),
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
    query: ArrivalDetailsQuery
  ): Promise<ArrivalDetails | null> {
    const arrival = await this.db.arrivals.get(query.id);
    if (arrival === undefined) return null;

    const codes = await this.db.recordCodes
      .where('[ownerKind+ownerId]')
      .equals(['arrival', query.id])
      .toArray();

    return {
      arrival,
      codes: this.projectArrivalCodes(codes),
    };
  }

  private projectListItems(
    rows: ArrivalRecord[],
    codes: RecordCodeRecord[]
  ): ArrivalListItem[] {
    const arrivalIdsWithCodes = new Set(codes.map((code) => code.ownerId));

    return rows.map((row) => ({
      id: row.id,
      kind: row.kind,
      subjectKind: row.subjectKind,
      title: row.title,
      description: row.description,
      occurredAt: row.occurredAt,
      amount: row.amount,
      currency: row.currency,
      linkUrl: row.linkUrl,
      note: row.note,
      supplierId: row.supplierId,
      supplierName: row.supplierName,
      productId: row.productId,
      productName: row.productName,
      categoryId: row.categoryId,
      categoryName: row.categoryName,
      originDraftId: row.originDraftId,
      originKind: row.originKind,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      hasCodes: arrivalIdsWithCodes.has(row.id),
    }));
  }

  private projectArrivalCodes(
    codes: RecordCodeRecord[]
  ): ArrivalDetailsCodeItem[] {
    return codes.map((code) => ({
      id: code.id,
      kind: code.kind,
      value: code.value,
    }));
  }

  private matchesListFilters(
    row: ArrivalListItem,
    filters: ArrivalListFilterInput,
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
    left: ArrivalListItem,
    right: ArrivalListItem,
    sort: ArrivalListSort
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
