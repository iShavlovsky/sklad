import type { RecordCodeKind } from '../../common/record-kinds.ts';
import type { ArrivalRecord } from '../../entries/arrival/arrival.record.ts';

export interface ArrivalDetailsQuery {
  id: string;
}

export interface ArrivalDetailsCodeItem {
  id: string;
  kind: RecordCodeKind;
  value: string;
}

export interface ArrivalDetails {
  arrival: ArrivalRecord;
  codes: ArrivalDetailsCodeItem[];
}
