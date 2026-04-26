import type { ValidationIssue } from '@/domain/validation/validation-issue.ts';

import type { DraftRecord } from '../draft.record.ts';

export type CreateDraftResult =
  | {
      ok: true;
      record: DraftRecord;
    }
  | {
      ok: false;
      code: 'VALIDATION_ERROR';
      issues: ValidationIssue[];
    }
  | {
      ok: false;
      code: 'DB_WRITE_FAILED';
    };
