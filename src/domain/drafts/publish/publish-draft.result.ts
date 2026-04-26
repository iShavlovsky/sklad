import type { ArrivalRecord } from '@/domain/entries/arrival/arrival.record.ts';
import type { DepartureRecord } from '@/domain/entries/departure.record.ts';
import type { ValidationIssue } from '@/domain/validation/validation-issue.ts';

import type { DraftRecord } from '../draft.record.ts';

import type { DraftPublishTargetKind } from './publish-draft.input.ts';

export interface PublishDraftNotFoundFailure {
  ok: false;
  code: 'DRAFT_NOT_FOUND';
  id: string;
}

export interface PublishDraftTargetInvalidFailure {
  ok: false;
  code: 'PUBLISH_TARGET_INVALID';
  draftKind: DraftRecord['kind'];
  targetKind: DraftPublishTargetKind;
}

export interface PublishDraftTargetValidationFailure {
  ok: false;
  code: 'TARGET_RESOLUTION_FAILED';
  targetKind: DraftPublishTargetKind;
  targetCode: 'VALIDATION_ERROR';
  issues: ValidationIssue[];
}

export interface PublishDraftTargetDirectoryFailure {
  ok: false;
  code: 'TARGET_RESOLUTION_FAILED';
  targetKind: DraftPublishTargetKind;
  targetCode:
    | 'SUPPLIER_RESOLVE_FAILED'
    | 'CATEGORY_RESOLVE_FAILED'
    | 'PRODUCT_RESOLVE_FAILED';
  field: 'supplier' | 'product' | 'category';
  reason: 'missing-id' | 'creation-not-confirmed';
}

export interface PublishDraftTargetLinkedArrivalFailure {
  ok: false;
  code: 'TARGET_RESOLUTION_FAILED';
  targetKind: DraftPublishTargetKind;
  targetCode: 'LINKED_ARRIVAL_RESOLVE_FAILED';
  field: 'basedOnArrivalId';
  reason: 'not-found';
  arrivalId: string;
}

export type PublishDraftTargetResolutionFailure =
  | PublishDraftTargetValidationFailure
  | PublishDraftTargetDirectoryFailure
  | PublishDraftTargetLinkedArrivalFailure;

/**
 * Result union for publishing a draft into a durable arrival or departure.
 *
 * Role in first data:
 * - preserves draft-specific failure semantics
 * - exposes the final created record when publish succeeds
 *
 * Non-goal:
 * - does not own transaction orchestration; that stays in infrastructure
 */
export type PublishDraftResult =
  | {
      ok: true;
      draftId: string;
      targetKind: DraftPublishTargetKind;
      record: ArrivalRecord | DepartureRecord;
    }
  | {
      ok: false;
      code: 'VALIDATION_ERROR';
      issues: ValidationIssue[];
    }
  | PublishDraftNotFoundFailure
  | PublishDraftTargetInvalidFailure
  | PublishDraftTargetResolutionFailure
  | {
      ok: false;
      code: 'DB_WRITE_FAILED';
    };
