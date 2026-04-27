import type { SortDirection } from '@/shared/utils/query';
import type { RecordKind, SubjectKind } from '@/domain/common/record-kinds.ts';
import type { DateRange } from '@/domain/common/value-objects.ts';

export interface DraftListFilters {
  search: string;
  kind: RecordKind | null;
  subjectKind: SubjectKind | null;
  updatedAt: DateRange;
}

export interface DraftListSort {
  field: 'title' | 'createdAt' | 'updatedAt';
  direction: SortDirection;
}

export interface DraftListQuery {
  filters: DraftListFilters;
  sort: DraftListSort;
  limit: number | null;
  offset: number;
}
