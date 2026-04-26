import type { RecordCodeKind } from '@/domain/common/record-kinds.ts';
import type { DepartureRecord } from '@/domain/entries/departure.record.ts';

export interface DepartureDetailsQuery {
  id: string;
}

export interface DepartureDetailsCodeItem {
  id: string;
  kind: RecordCodeKind;
  value: string;
}

export interface DepartureDetails {
  departure: DepartureRecord;
  codes: DepartureDetailsCodeItem[];
}
