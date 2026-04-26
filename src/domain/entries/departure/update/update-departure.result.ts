import type { ValidationIssue } from '@/domain/validation/validation-issue.ts';

import type { DepartureRecord } from '../../departure.record.ts';
import type {
  CreateDepartureDirectoryResolveFailure,
  CreateDepartureLinkedArrivalResolveFailure,
} from '../create/create-departure.result.ts';

export interface UpdateDepartureNotFoundFailure {
  ok: false;
  code: 'DEPARTURE_NOT_FOUND';
  id: string;
}

export type UpdateDepartureResult =
  | {
      ok: true;
      record: DepartureRecord;
    }
  | {
      ok: false;
      code: 'VALIDATION_ERROR';
      issues: ValidationIssue[];
    }
  | UpdateDepartureNotFoundFailure
  | CreateDepartureDirectoryResolveFailure
  | CreateDepartureLinkedArrivalResolveFailure
  | {
      ok: false;
      code: 'DB_WRITE_FAILED';
    };
