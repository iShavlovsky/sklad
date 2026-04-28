import type { RecordCodeInput } from '@/domain/codes/record-code.input.ts';
import type { RecordCodeRecord } from '@/domain/codes/record-code.record.ts';
import type { DirectoryRefSnapshot } from '@/domain/common/value-objects.ts';
import type { ArrivalRecord } from '@/domain/entries/arrival/arrival.record.ts';
import type { CreateArrivalInput } from '@/domain/entries/arrival/create/create-arrival.input.ts';
import type { CreateArrivalResult } from '@/domain/entries/arrival/create/create-arrival.result.ts';
import { CreateArrivalService } from '@/domain/entries/arrival/create/create-arrival.service.ts';
import type { DepartureRecord } from '@/domain/entries/departure.record.ts';
import type { CreateDepartureInput } from '@/domain/entries/departure/create/create-departure.input.ts';
import type { CreateDepartureResult } from '@/domain/entries/departure/create/create-departure.result.ts';
import { CreateDepartureService } from '@/domain/entries/departure/create/create-departure.service.ts';
import { mapZodIssues } from '@/domain/validation/map-zod-issues.ts';

import type { ArrivalDraftPayload } from '../arrival-draft.payload.ts';
import type { DepartureDraftPayload } from '../departure-draft.payload.ts';
import type { DraftRecord } from '../draft.record.ts';

import type { PublishDraftInput } from './publish-draft.input.ts';
import type { PublishDraftDependencies } from './publish-draft.ports.ts';
import type {
  PublishDraftResult,
  PublishDraftTargetResolutionFailure,
} from './publish-draft.result.ts';
import { publishDraftInputSchema } from './publish-draft.schema.ts';

type ArrivalCreateFailure = Exclude<CreateArrivalResult, { ok: true }>;
type DepartureCreateFailure = Exclude<CreateDepartureResult, { ok: true }>;

function normalizePayloadQuantityCost(payload: {
  money: { amount: number | null; currency: string | null };
  quantityCost?: {
    quantity: number | null;
    totalCost: number | null;
    unitCost: number | null;
  };
}) {
  if (payload.quantityCost) {
    return payload.quantityCost;
  }

  const hasCurrency =
    payload.money.currency !== null && payload.money.currency.trim() !== '';
  const quantity = !hasCurrency ? payload.money.amount : null;
  const totalCost = hasCurrency ? payload.money.amount : null;

  return {
    quantity,
    totalCost,
    unitCost:
      quantity !== null && quantity > 0 && totalCost !== null
        ? totalCost / quantity
        : null,
  };
}

function mapDraftDirectoryInput(snapshot: DirectoryRefSnapshot): {
  id: string | null;
  name: string | null;
  createIfMissing: boolean;
} {
  return {
    id: snapshot.id,
    name: snapshot.name,
    createIfMissing: snapshot.id === null && snapshot.name !== null,
  };
}

function mapDraftCodes(codes: RecordCodeRecord[]): RecordCodeInput[] {
  return codes.map((code) => ({
    value: code.value,
    kind: code.kind,
  }));
}

export class PublishDraftService {
  private readonly arrivalCreateService = new CreateArrivalService();
  private readonly departureCreateService = new CreateDepartureService();

  public async execute(
    input: PublishDraftInput,
    dependencies: PublishDraftDependencies
  ): Promise<PublishDraftResult> {
    const parsed = publishDraftInputSchema.safeParse(input);

    if (!parsed.success) {
      return {
        ok: false,
        code: 'VALIDATION_ERROR',
        issues: mapZodIssues(parsed.error.issues),
      };
    }

    const { data } = parsed;

    try {
      const draft = await dependencies.draftRepository.getById(data.id);
      if (draft === undefined) {
        return {
          ok: false,
          code: 'DRAFT_NOT_FOUND',
          id: data.id,
        };
      }

      if (draft.kind !== data.targetKind) {
        return {
          ok: false,
          code: 'PUBLISH_TARGET_INVALID',
          draftKind: draft.kind,
          targetKind: data.targetKind,
        };
      }

      const draftCodes = await dependencies.recordCodeRepository.listByOwner(
        'draft',
        draft.id
      );

      const publishResult =
        data.targetKind === 'arrival'
          ? await this.publishArrival(draft, draftCodes, dependencies)
          : await this.publishDeparture(draft, draftCodes, dependencies);

      if (!publishResult.ok) {
        return publishResult;
      }

      await dependencies.recordCodeRepository.deleteOwnerCodes(
        'draft',
        draft.id
      );
      await dependencies.draftRepository.delete(draft.id);

      return {
        ok: true,
        draftId: draft.id,
        targetKind: data.targetKind,
        record: publishResult.record,
      } satisfies PublishDraftResult;
    } catch {
      return {
        ok: false,
        code: 'DB_WRITE_FAILED',
      };
    }
  }

  private async publishArrival(
    draft: DraftRecord,
    draftCodes: RecordCodeRecord[],
    dependencies: PublishDraftDependencies
  ): Promise<
    | { ok: true; record: ArrivalRecord }
    | PublishDraftTargetResolutionFailure
    | { ok: false; code: 'DB_WRITE_FAILED' }
  > {
    const payload = draft.payload as ArrivalDraftPayload;

    const targetInput: CreateArrivalInput = {
      title: draft.title,
      subjectKind: payload.subjectKind,
      description: payload.description,
      occurredAt: payload.occurredAt ?? '',
      money: payload.money,
      quantityCost: normalizePayloadQuantityCost(payload),
      linkUrl: payload.linkUrl,
      note: payload.note,
      supplier: mapDraftDirectoryInput(payload.supplier),
      product: mapDraftDirectoryInput(payload.product),
      category: mapDraftDirectoryInput(payload.category),
      codes: mapDraftCodes(draftCodes),
      originDraftId: draft.id,
    };

    const result = await this.arrivalCreateService.execute(
      targetInput,
      dependencies.arrivalCreateDependencies
    );

    if (result.ok) {
      return {
        ok: true,
        record: result.record,
      };
    }

    return this.mapArrivalTargetFailure(result);
  }

  private async publishDeparture(
    draft: DraftRecord,
    draftCodes: RecordCodeRecord[],
    dependencies: PublishDraftDependencies
  ): Promise<
    | { ok: true; record: DepartureRecord }
    | PublishDraftTargetResolutionFailure
    | { ok: false; code: 'DB_WRITE_FAILED' }
  > {
    const payload = draft.payload as DepartureDraftPayload;

    const targetInput: CreateDepartureInput = {
      title: draft.title,
      subjectKind: payload.subjectKind,
      description: payload.description,
      occurredAt: payload.occurredAt ?? '',
      money: payload.money,
      quantityCost: normalizePayloadQuantityCost(payload),
      note: payload.note,
      direction: payload.direction,
      supplier: mapDraftDirectoryInput(payload.supplier),
      product: mapDraftDirectoryInput(payload.product),
      category: mapDraftDirectoryInput(payload.category),
      mode: payload.mode,
      basedOnArrivalId: payload.basedOnArrivalId,
      codes: mapDraftCodes(draftCodes),
      originDraftId: draft.id,
    };

    const result = await this.departureCreateService.execute(
      targetInput,
      dependencies.departureCreateDependencies
    );

    if (result.ok) {
      return {
        ok: true,
        record: result.record,
      };
    }

    return this.mapDepartureTargetFailure(result);
  }

  private mapArrivalTargetFailure(
    result: ArrivalCreateFailure
  ):
    | PublishDraftTargetResolutionFailure
    | { ok: false; code: 'DB_WRITE_FAILED' } {
    if (result.code === 'DB_WRITE_FAILED') {
      return result;
    }

    if (result.code === 'VALIDATION_ERROR') {
      return {
        ok: false,
        code: 'TARGET_RESOLUTION_FAILED',
        targetKind: 'arrival',
        targetCode: 'VALIDATION_ERROR',
        issues: result.issues,
      };
    }

    return {
      ok: false,
      code: 'TARGET_RESOLUTION_FAILED',
      targetKind: 'arrival',
      targetCode: result.code,
      field: result.field,
      reason: result.reason,
    };
  }

  private mapDepartureTargetFailure(
    result: DepartureCreateFailure
  ):
    | PublishDraftTargetResolutionFailure
    | { ok: false; code: 'DB_WRITE_FAILED' } {
    if (result.code === 'DB_WRITE_FAILED') {
      return result;
    }

    if (result.code === 'VALIDATION_ERROR') {
      return {
        ok: false,
        code: 'TARGET_RESOLUTION_FAILED',
        targetKind: 'departure',
        targetCode: 'VALIDATION_ERROR',
        issues: result.issues,
      };
    }

    if (result.code === 'LINKED_ARRIVAL_RESOLVE_FAILED') {
      return {
        ok: false,
        code: 'TARGET_RESOLUTION_FAILED',
        targetKind: 'departure',
        targetCode: result.code,
        field: result.field,
        reason: result.reason,
        arrivalId: result.arrivalId,
      };
    }

    return {
      ok: false,
      code: 'TARGET_RESOLUTION_FAILED',
      targetKind: 'departure',
      targetCode: result.code,
      field: result.field,
      reason: result.reason,
    };
  }
}
