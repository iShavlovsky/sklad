import type { CreateArrivalInput } from '@/domain/entries/arrival/create/create-arrival.input.ts';
import type { CreateArrivalDependencies } from '@/domain/entries/arrival/create/create-arrival.ports.ts';
import type { CreateArrivalResult } from '@/domain/entries/arrival/create/create-arrival.result.ts';
import { CreateArrivalService } from '@/domain/entries/arrival/create/create-arrival.service.ts';
import type { DeleteArrivalInput } from '@/domain/entries/arrival/delete/delete-arrival.input.ts';
import type { DeleteArrivalDependencies } from '@/domain/entries/arrival/delete/delete-arrival.ports.ts';
import type { DeleteArrivalResult } from '@/domain/entries/arrival/delete/delete-arrival.result.ts';
import { DeleteArrivalService } from '@/domain/entries/arrival/delete/delete-arrival.service.ts';
import type { UpdateArrivalInput } from '@/domain/entries/arrival/update/update-arrival.input.ts';
import type { UpdateArrivalDependencies } from '@/domain/entries/arrival/update/update-arrival.ports.ts';
import type { UpdateArrivalResult } from '@/domain/entries/arrival/update/update-arrival.result.ts';
import { UpdateArrivalService } from '@/domain/entries/arrival/update/update-arrival.service.ts';
import { appDb } from '@/infrastructure/db';
import { RecordCodeRepository } from '@/infrastructure/repositories/codes/record-code.repository';
import { CategoryRepository } from '@/infrastructure/repositories/directories/category.repository';
import { ProductRepository } from '@/infrastructure/repositories/directories/product.repository';
import { SupplierRepository } from '@/infrastructure/repositories/directories/supplier.repository';
import { ArrivalRepository } from '@/infrastructure/repositories/journals/arrival.repository';
import { DepartureRepository } from '@/infrastructure/repositories/journals/departure.repository';

/**
 * Infrastructure-owned arrival write composition for first data.
 *
 * It binds repositories and Dexie transactions around domain services so UI
 * hooks can call a stable facade without owning infrastructure concerns.
 */
export interface ArrivalComposition {
  createArrivalDependencies: CreateArrivalDependencies;
  createArrivalService: {
    execute(input: CreateArrivalInput): Promise<CreateArrivalResult>;
  };
  deleteArrivalService: {
    execute(input: DeleteArrivalInput): Promise<DeleteArrivalResult>;
  };
  updateArrivalService: {
    execute(input: UpdateArrivalInput): Promise<UpdateArrivalResult>;
  };
}

class ArrivalOperationAbortError<
  TResult extends { ok: boolean },
> extends Error {
  public readonly result: TResult;

  public constructor(result: TResult) {
    super('ARRIVAL_OPERATION_ABORTED');
    this.result = result;
  }
}

async function runArrivalTransaction<TResult extends { ok: boolean }>(
  operation: () => Promise<TResult>
): Promise<TResult> {
  try {
    return await appDb.transaction(
      'rw',
      [
        appDb.arrivals,
        appDb.suppliers,
        appDb.categories,
        appDb.products,
        appDb.recordCodes,
      ],
      async () => {
        const result = await operation();
        if (!result.ok) {
          throw new ArrivalOperationAbortError(result);
        }

        return result;
      }
    );
  } catch (error) {
    if (error instanceof ArrivalOperationAbortError) {
      return error.result;
    }

    throw error;
  }
}

class ArrivalDeleteOperationAbortError<
  TResult extends { ok: boolean },
> extends Error {
  public readonly result: TResult;

  public constructor(result: TResult) {
    super('ARRIVAL_DELETE_OPERATION_ABORTED');
    this.result = result;
  }
}

async function runArrivalDeleteTransaction<TResult extends { ok: boolean }>(
  operation: () => Promise<TResult>
): Promise<TResult> {
  try {
    return await appDb.transaction(
      'rw',
      [appDb.arrivals, appDb.departures, appDb.recordCodes],
      async () => {
        const result = await operation();
        if (!result.ok) {
          throw new ArrivalDeleteOperationAbortError(result);
        }

        return result;
      }
    );
  } catch (error) {
    if (error instanceof ArrivalDeleteOperationAbortError) {
      return error.result;
    }

    throw error;
  }
}

/**
 * Creates the public arrival write facade used by feature hooks.
 */
export function createArrivalComposition(): ArrivalComposition {
  const arrivalRepository = new ArrivalRepository(appDb.arrivals);
  const departureRepository = new DepartureRepository(appDb.departures);
  const supplierRepository = new SupplierRepository(appDb.suppliers);
  const categoryRepository = new CategoryRepository(appDb.categories);
  const productRepository = new ProductRepository(appDb.products);
  const recordCodeRepository = new RecordCodeRepository(appDb.recordCodes);
  const createArrivalServiceImpl = new CreateArrivalService();
  const deleteArrivalServiceImpl = new DeleteArrivalService();
  const updateArrivalServiceImpl = new UpdateArrivalService();
  const createArrivalDependencies: CreateArrivalDependencies = {
    arrivalRepository,
    supplierRepository,
    categoryRepository,
    productRepository,
    recordCodeRepository,
  };
  const deleteArrivalDependencies: DeleteArrivalDependencies = {
    arrivalRepository,
    departureRepository,
    recordCodeRepository,
  };
  const updateArrivalDependencies: UpdateArrivalDependencies = {
    arrivalRepository,
    supplierRepository,
    categoryRepository,
    productRepository,
    recordCodeRepository,
  };

  return {
    createArrivalDependencies,
    createArrivalService: {
      execute(input: CreateArrivalInput): Promise<CreateArrivalResult> {
        return runArrivalTransaction(() =>
          createArrivalServiceImpl.execute(input, createArrivalDependencies)
        );
      },
    },
    deleteArrivalService: {
      execute(input: DeleteArrivalInput): Promise<DeleteArrivalResult> {
        return runArrivalDeleteTransaction(() =>
          deleteArrivalServiceImpl.execute(input, deleteArrivalDependencies)
        );
      },
    },
    updateArrivalService: {
      execute(input: UpdateArrivalInput): Promise<UpdateArrivalResult> {
        return runArrivalTransaction(() =>
          updateArrivalServiceImpl.execute(input, updateArrivalDependencies)
        );
      },
    },
  };
}
