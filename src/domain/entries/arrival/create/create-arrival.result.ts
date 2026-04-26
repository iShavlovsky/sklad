import type { ValidationIssue } from '@/domain/validation/validation-issue';

import type { ArrivalRecord } from '../arrival.record.ts';

/**
 * Domain-level failure shape for a directory dependency that could not be
 * resolved while creating an arrival.
 */
export type CreateArrivalDirectoryResolveFailureField =
  | 'supplier'
  | 'product'
  | 'category';

export type CreateArrivalDirectoryResolveFailureReason =
  | 'missing-id'
  | 'creation-not-confirmed';

export type CreateArrivalDirectoryResolveFailureCode =
  | 'SUPPLIER_RESOLVE_FAILED'
  | 'CATEGORY_RESOLVE_FAILED'
  | 'PRODUCT_RESOLVE_FAILED';

export interface CreateArrivalDirectoryResolveFailure {
  ok: false;
  code: CreateArrivalDirectoryResolveFailureCode;
  field: CreateArrivalDirectoryResolveFailureField;
  reason: CreateArrivalDirectoryResolveFailureReason;
}

/**
 * Result union returned by {@link CreateArrivalService}.
 *
 * Use `ok` as the discriminant in UI or infrastructure code.
 */
export type CreateArrivalResult =
  | {
      ok: true;
      record: ArrivalRecord;
    }
  | {
      ok: false;
      code: 'VALIDATION_ERROR';
      issues: ValidationIssue[];
    }
  | CreateArrivalDirectoryResolveFailure
  | {
      ok: false;
      code: 'DB_WRITE_FAILED';
    };
