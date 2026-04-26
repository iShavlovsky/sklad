import type { RecordCodeRecord } from '@/domain/codes/record-code.record.ts';

export interface RecordCodeDetailsQuery {
  id: string;
}

export type RecordCodeDetailsItem = RecordCodeRecord;

export interface RecordCodeDetails {
  recordCode: RecordCodeDetailsItem;
}
