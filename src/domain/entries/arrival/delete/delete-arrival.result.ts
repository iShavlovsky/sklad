import type { ValidationIssue } from '@/domain/validation/validation-issue.ts';

export interface DeleteArrivalNotFoundFailure {
  ok: false;
  code: 'ARRIVAL_NOT_FOUND';
  id: string;
}

export interface DeleteArrivalReferencedFailure {
  ok: false;
  code: 'ARRIVAL_HAS_DEPENDENT_DEPARTURES';
  id: string;
  departureCount: number;
}

export type DeleteArrivalResult =
  | {
      ok: true;
      id: string;
    }
  | {
      ok: false;
      code: 'VALIDATION_ERROR';
      issues: ValidationIssue[];
    }
  | DeleteArrivalNotFoundFailure
  | DeleteArrivalReferencedFailure
  | {
      ok: false;
      code: 'DB_WRITE_FAILED';
    };
