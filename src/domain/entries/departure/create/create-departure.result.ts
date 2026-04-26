import type { ValidationIssue } from '../../../validation/validation-issue.ts';
import type { DepartureRecord } from '../../departure.record.ts';

/**
 * Domain-level directory resolution failure returned from departure creation
 * when reusable directory records cannot be reused or created.
 */
export type CreateDepartureDirectoryResolveFailureField =
  | 'supplier'
  | 'product'
  | 'category';

export type CreateDepartureDirectoryResolveFailureReason =
  | 'missing-id'
  | 'creation-not-confirmed';

export type CreateDepartureDirectoryResolveFailureCode =
  | 'SUPPLIER_RESOLVE_FAILED'
  | 'CATEGORY_RESOLVE_FAILED'
  | 'PRODUCT_RESOLVE_FAILED';

export interface CreateDepartureDirectoryResolveFailure {
  ok: false;
  code: CreateDepartureDirectoryResolveFailureCode;
  field: CreateDepartureDirectoryResolveFailureField;
  reason: CreateDepartureDirectoryResolveFailureReason;
}

export interface CreateDepartureLinkedArrivalResolveFailure {
  ok: false;
  code: 'LINKED_ARRIVAL_RESOLVE_FAILED';
  field: 'basedOnArrivalId';
  reason: 'not-found';
  arrivalId: string;
}

/**
 * Result union returned by the departure creation workflow.
 *
 * It keeps validation, linked-arrival resolution, and persistence failures
 * explicit so UI hooks can branch without inspecting thrown errors.
 */
export type CreateDepartureResult =
  | {
      ok: true;
      record: DepartureRecord;
    }
  | {
      ok: false;
      code: 'VALIDATION_ERROR';
      issues: ValidationIssue[];
    }
  | CreateDepartureDirectoryResolveFailure
  | CreateDepartureLinkedArrivalResolveFailure
  | {
      ok: false;
      code: 'DB_WRITE_FAILED';
    };
