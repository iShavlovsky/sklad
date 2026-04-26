import type { ValidationIssue } from '@/domain/validation/validation-issue.ts';

export interface DeleteDepartureNotFoundFailure {
  ok: false;
  code: 'DEPARTURE_NOT_FOUND';
  id: string;
}

export type DeleteDepartureResult =
  | {
      ok: true;
      id: string;
    }
  | {
      ok: false;
      code: 'VALIDATION_ERROR';
      issues: ValidationIssue[];
    }
  | DeleteDepartureNotFoundFailure
  | {
      ok: false;
      code: 'DB_WRITE_FAILED';
    };
