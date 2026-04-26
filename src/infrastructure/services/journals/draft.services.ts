import type { CreateDraftInput } from '@/domain/drafts/create/create-draft.input.ts';
import type { CreateDraftDependencies } from '@/domain/drafts/create/create-draft.ports.ts';
import type { CreateDraftResult } from '@/domain/drafts/create/create-draft.result.ts';
import { CreateDraftService } from '@/domain/drafts/create/create-draft.service.ts';
import type { DeleteDraftInput } from '@/domain/drafts/delete/delete-draft.input.ts';
import type { DeleteDraftDependencies } from '@/domain/drafts/delete/delete-draft.ports.ts';
import type { DeleteDraftResult } from '@/domain/drafts/delete/delete-draft.result.ts';
import { DeleteDraftService } from '@/domain/drafts/delete/delete-draft.service.ts';
import type { PublishDraftInput } from '@/domain/drafts/publish/publish-draft.input.ts';
import type { PublishDraftDependencies } from '@/domain/drafts/publish/publish-draft.ports.ts';
import type { PublishDraftResult } from '@/domain/drafts/publish/publish-draft.result.ts';
import { PublishDraftService } from '@/domain/drafts/publish/publish-draft.service.ts';
import type { UpdateDraftInput } from '@/domain/drafts/update/update-draft.input.ts';
import type { UpdateDraftDependencies } from '@/domain/drafts/update/update-draft.ports.ts';
import type { UpdateDraftResult } from '@/domain/drafts/update/update-draft.result.ts';
import { UpdateDraftService } from '@/domain/drafts/update/update-draft.service.ts';
import type { CreateArrivalDependencies } from '@/domain/entries/arrival/create/create-arrival.ports.ts';
import type { CreateDepartureDependencies } from '@/domain/entries/departure/create/create-departure.ports.ts';
import { appDb } from '@/infrastructure/db';
import { RecordCodeRepository } from '@/infrastructure/repositories/codes/record-code.repository';
import { DraftRepository } from '@/infrastructure/repositories/journals/draft.repository';

/**
 * Cross-slice dependencies needed when publishing a draft into a durable
 * arrival or departure record.
 */
export interface DraftCompositionDependencies {
  arrivalCreateDependencies: CreateArrivalDependencies;
  departureCreateDependencies: CreateDepartureDependencies;
}

/**
 * Infrastructure-owned draft write composition for first data.
 */
export interface DraftComposition {
  createDraftService: {
    execute(input: CreateDraftInput): Promise<CreateDraftResult>;
  };
  deleteDraftService: {
    execute(input: DeleteDraftInput): Promise<DeleteDraftResult>;
  };
  updateDraftService: {
    execute(input: UpdateDraftInput): Promise<UpdateDraftResult>;
  };
  publishDraftService: {
    execute(input: PublishDraftInput): Promise<PublishDraftResult>;
  };
}

class DraftOperationAbortError<TResult extends { ok: boolean }> extends Error {
  public readonly result: TResult;

  public constructor(result: TResult) {
    super('DRAFT_OPERATION_ABORTED');
    this.result = result;
  }
}

async function runDraftTransaction<TResult extends { ok: boolean }>(
  operation: () => Promise<TResult>
): Promise<TResult> {
  try {
    return await appDb.transaction(
      'rw',
      [appDb.drafts, appDb.recordCodes],
      async () => {
        const result = await operation();
        if (!result.ok) {
          throw new DraftOperationAbortError(result);
        }

        return result;
      }
    );
  } catch (error) {
    if (error instanceof DraftOperationAbortError) {
      return error.result;
    }

    throw error;
  }
}

async function runPublishDraftTransaction<TResult extends { ok: boolean }>(
  operation: () => Promise<TResult>
): Promise<TResult> {
  try {
    return await appDb.transaction(
      'rw',
      [
        appDb.arrivals,
        appDb.departures,
        appDb.drafts,
        appDb.suppliers,
        appDb.categories,
        appDb.products,
        appDb.recordCodes,
      ],
      async () => {
        const result = await operation();
        if (!result.ok) {
          throw new DraftOperationAbortError(result);
        }

        return result;
      }
    );
  } catch (error) {
    if (error instanceof DraftOperationAbortError) {
      return error.result;
    }

    throw error;
  }
}

/**
 * Creates the draft workflow facade used by first-data hooks.
 *
 * The composition keeps Dexie transaction scope and publish orchestration out
 * of React code.
 */
export function createDraftComposition(
  dependencies: DraftCompositionDependencies
): DraftComposition {
  const draftRepository = new DraftRepository(appDb.drafts);
  const recordCodeRepository = new RecordCodeRepository(appDb.recordCodes);
  const createDraftServiceImpl = new CreateDraftService();
  const updateDraftServiceImpl = new UpdateDraftService();
  const deleteDraftServiceImpl = new DeleteDraftService();
  const publishDraftServiceImpl = new PublishDraftService();

  const createDraftDependencies: CreateDraftDependencies = {
    draftRepository,
    recordCodeRepository,
  };
  const updateDraftDependencies: UpdateDraftDependencies = {
    draftRepository,
    recordCodeRepository,
  };
  const deleteDraftDependencies: DeleteDraftDependencies = {
    draftRepository,
    recordCodeRepository,
  };
  const publishDraftDependencies: PublishDraftDependencies = {
    draftRepository,
    recordCodeRepository,
    arrivalCreateDependencies: dependencies.arrivalCreateDependencies,
    departureCreateDependencies: dependencies.departureCreateDependencies,
  };

  return {
    createDraftService: {
      execute(input: CreateDraftInput): Promise<CreateDraftResult> {
        return runDraftTransaction(() =>
          createDraftServiceImpl.execute(input, createDraftDependencies)
        );
      },
    },
    deleteDraftService: {
      execute(input: DeleteDraftInput): Promise<DeleteDraftResult> {
        return runDraftTransaction(() =>
          deleteDraftServiceImpl.execute(input, deleteDraftDependencies)
        );
      },
    },
    updateDraftService: {
      execute(input: UpdateDraftInput): Promise<UpdateDraftResult> {
        return runDraftTransaction(() =>
          updateDraftServiceImpl.execute(input, updateDraftDependencies)
        );
      },
    },
    publishDraftService: {
      execute(input: PublishDraftInput): Promise<PublishDraftResult> {
        return runPublishDraftTransaction(() =>
          publishDraftServiceImpl.execute(input, publishDraftDependencies)
        );
      },
    },
  };
}
