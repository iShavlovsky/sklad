import type { RecordCodeRecord } from '@/domain/codes/record-code.record.ts';

/**
 * Query contract for normalized code lookup.
 *
 * Callers should provide a pre-normalized value to keep lookup rules explicit
 * and reusable across scanner/buffer/UI surfaces.
 */
export interface RecordCodeLookupQuery {
  normalizedValue: string;
}

export type RecordCodeLookupItem = RecordCodeRecord;

/**
 * Result shape returned by record-code lookup queries.
 */
export interface RecordCodeLookupResult {
  normalizedValue: string;
  matches: RecordCodeLookupItem[];
}
