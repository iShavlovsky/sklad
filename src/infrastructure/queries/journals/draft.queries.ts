import type { RecordCodeRecord } from '@/domain/codes/record-code.record.ts';
import {
  compareIsoDate,
  compareNullableString,
  containsNormalizedText,
  matchesDateRange,
  normalizeSearch,
  paginate,
} from '@/domain/common/query-helpers';
import type { DraftRecord } from '@/domain/drafts/draft.record.ts';
import type {
  DraftDetails,
  DraftDetailsCodeItem,
  DraftDetailsQuery,
} from '@/domain/queries/draft/draft-details.query.ts';
import type {
  DraftListItem,
  DraftListItemPayloadSummary,
} from '@/domain/queries/draft/draft-list.item.ts';
import type {
  DraftListQuery,
  DraftListSort,
} from '@/domain/queries/draft/draft-list.query.ts';
import type { AppDb } from '@/infrastructure/db/app-db';

type DraftListFilterInput = DraftListQuery['filters'];

export class DraftQueries {
  private readonly db: AppDb;

  public constructor(db: AppDb) {
    this.db = db;
  }

  public async list(query: DraftListQuery): Promise<DraftListItem[]> {
    const [rows, codes] = await Promise.all([
      this.db.drafts.toArray(),
      this.db.recordCodes.where('ownerKind').equals('draft').toArray(),
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

  public async details(query: DraftDetailsQuery): Promise<DraftDetails | null> {
    const draft = await this.db.drafts.get(query.id);
    if (draft === undefined) return null;

    const codes = await this.db.recordCodes
      .where('[ownerKind+ownerId]')
      .equals(['draft', query.id])
      .toArray();

    return {
      draft,
      codes: this.projectDraftCodes(codes),
    };
  }

  private projectListItems(
    rows: DraftRecord[],
    codes: RecordCodeRecord[]
  ): DraftListItem[] {
    const draftIdsWithCodes = new Set(codes.map((code) => code.ownerId));

    return rows.map((row) => ({
      id: row.id,
      kind: row.kind,
      title: row.title,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      hasCodes: draftIdsWithCodes.has(row.id),
      payloadSummary: this.projectPayloadSummary(row),
    }));
  }

  private projectPayloadSummary(row: DraftRecord): DraftListItemPayloadSummary {
    if ('linkUrl' in row.payload) {
      return {
        kind: 'arrival',
        subjectKind: row.payload.subjectKind,
        occurredAt: row.payload.occurredAt,
        linkUrl: row.payload.linkUrl,
        note: row.payload.note,
      };
    }

    return {
      kind: 'departure',
      subjectKind: row.payload.subjectKind,
      occurredAt: row.payload.occurredAt,
      note: row.payload.note,
      direction: row.payload.direction,
      mode: row.payload.mode,
      basedOnArrivalId: row.payload.basedOnArrivalId,
    };
  }

  private projectDraftCodes(codes: RecordCodeRecord[]): DraftDetailsCodeItem[] {
    return codes.map((code) => ({
      id: code.id,
      kind: code.kind,
      value: code.value,
    }));
  }

  private matchesListFilters(
    row: DraftListItem,
    filters: DraftListFilterInput,
    normalizedSearch: string
  ): boolean {
    if (filters.kind !== null && row.kind !== filters.kind) {
      return false;
    }

    if (
      filters.subjectKind !== null &&
      row.payloadSummary.subjectKind !== filters.subjectKind
    ) {
      return false;
    }

    if (!containsNormalizedText([row.title], normalizedSearch)) {
      return false;
    }

    if (!matchesDateRange(row.updatedAt, filters.updatedAt)) {
      return false;
    }

    return true;
  }

  private compareListItems(
    left: DraftListItem,
    right: DraftListItem,
    sort: DraftListSort
  ): number {
    let result = 0;

    switch (sort.field) {
      case 'title':
        result = compareNullableString(left.title, right.title, sort.direction);
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
