import type { ValidationIssue } from '@/domain/validation/validation-issue.ts';

import type { DraftRecord } from '../draft.record.ts';

export interface UpdateDraftNotFoundFailure {
  ok: false;
  code: 'DRAFT_NOT_FOUND';
  id: string;
}

export type UpdateDraftResult =
  | {
      ok: true;
      record: DraftRecord;
    }
  | {
      ok: false;
      code: 'VALIDATION_ERROR';
      issues: ValidationIssue[];
    }
  | UpdateDraftNotFoundFailure
  | {
      ok: false;
      code: 'DB_WRITE_FAILED';
    };
