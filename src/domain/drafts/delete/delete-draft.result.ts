import type { ValidationIssue } from '@/domain/validation/validation-issue.ts';

export interface DeleteDraftNotFoundFailure {
  ok: false;
  code: 'DRAFT_NOT_FOUND';
  id: string;
}

export type DeleteDraftResult =
  | {
      ok: true;
      id: string;
    }
  | {
      ok: false;
      code: 'VALIDATION_ERROR';
      issues: ValidationIssue[];
    }
  | DeleteDraftNotFoundFailure
  | {
      ok: false;
      code: 'DB_WRITE_FAILED';
    };
