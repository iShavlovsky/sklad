import type { ValidationIssue } from '@/domain/validation/validation-issue';

import type { ArrivalRecord } from '../arrival.record.ts';
import type { CreateArrivalDirectoryResolveFailure } from '../create/create-arrival.result.ts';

export interface UpdateArrivalNotFoundFailure {
  ok: false;
  code: 'ARRIVAL_NOT_FOUND';
  id: string;
}

export type UpdateArrivalResult =
  | {
      ok: true;
      record: ArrivalRecord;
    }
  | {
      ok: false;
      code: 'VALIDATION_ERROR';
      issues: ValidationIssue[];
    }
  | UpdateArrivalNotFoundFailure
  | CreateArrivalDirectoryResolveFailure
  | {
      ok: false;
      code: 'DB_WRITE_FAILED';
    };
