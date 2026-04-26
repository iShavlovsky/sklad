import type { CreateDepartureInput } from '@/domain/entries/departure/create/create-departure.input.ts';
import type { CreateDepartureDependencies } from '@/domain/entries/departure/create/create-departure.ports.ts';
import type { CreateDepartureResult } from '@/domain/entries/departure/create/create-departure.result.ts';
import { CreateDepartureService } from '@/domain/entries/departure/create/create-departure.service.ts';
import type { DeleteDepartureInput } from '@/domain/entries/departure/delete/delete-departure.input.ts';
import type { DeleteDepartureDependencies } from '@/domain/entries/departure/delete/delete-departure.ports.ts';
import type { DeleteDepartureResult } from '@/domain/entries/departure/delete/delete-departure.result.ts';
import { DeleteDepartureService } from '@/domain/entries/departure/delete/delete-departure.service.ts';
import type { UpdateDepartureInput } from '@/domain/entries/departure/update/update-departure.input.ts';
import type { UpdateDepartureDependencies } from '@/domain/entries/departure/update/update-departure.ports.ts';
import type { UpdateDepartureResult } from '@/domain/entries/departure/update/update-departure.result.ts';
import { UpdateDepartureService } from '@/domain/entries/departure/update/update-departure.service.ts';
import { appDb } from '@/infrastructure/db';
import { RecordCodeRepository } from '@/infrastructure/repositories/codes/record-code.repository';
import { CategoryRepository } from '@/infrastructure/repositories/directories/category.repository';
import { ProductRepository } from '@/infrastructure/repositories/directories/product.repository';
import { SupplierRepository } from '@/infrastructure/repositories/directories/supplier.repository';
import { ArrivalRepository } from '@/infrastructure/repositories/journals/arrival.repository';
import { DepartureRepository } from '@/infrastructure/repositories/journals/departure.repository';

/**
 * Infrastructure-owned departure write composition for first data.
 *
 * It keeps transaction scope, repository wiring, and domain service execution
 * out of UI hooks.
 */
export interface DepartureComposition {
  createDepartureDependencies: CreateDepartureDependencies;
  createDepartureService: {
    execute(input: CreateDepartureInput): Promise<CreateDepartureResult>;
  };
  deleteDepartureService: {
    execute(input: DeleteDepartureInput): Promise<DeleteDepartureResult>;
  };
  updateDepartureService: {
    execute(input: UpdateDepartureInput): Promise<UpdateDepartureResult>;
  };
}

class DepartureOperationAbortError<
  TResult extends { ok: boolean },
> extends Error {
  public readonly result: TResult;

  public constructor(result: TResult) {
    super('DEPARTURE_OPERATION_ABORTED');
    this.result = result;
  }
}

async function runDepartureTransaction<TResult extends { ok: boolean }>(
  operation: () => Promise<TResult>
): Promise<TResult> {
  try {
    return await appDb.transaction(
      'rw',
      [
        appDb.arrivals,
        appDb.departures,
        appDb.suppliers,
        appDb.categories,
        appDb.products,
        appDb.recordCodes,
      ],
      async () => {
        const result = await operation();
        if (!result.ok) {
          throw new DepartureOperationAbortError(result);
        }

        return result;
      }
    );
  } catch (error) {
    if (error instanceof DepartureOperationAbortError) {
      return error.result;
    }

    throw error;
  }
}

class DepartureDeleteOperationAbortError<
  TResult extends { ok: boolean },
> extends Error {
  public readonly result: TResult;

  public constructor(result: TResult) {
    super('DEPARTURE_DELETE_OPERATION_ABORTED');
    this.result = result;
  }
}

async function runDepartureDeleteTransaction<TResult extends { ok: boolean }>(
  operation: () => Promise<TResult>
): Promise<TResult> {
  try {
    return await appDb.transaction(
      'rw',
      [appDb.departures, appDb.recordCodes],
      async () => {
        const result = await operation();
        if (!result.ok) {
          throw new DepartureDeleteOperationAbortError(result);
        }

        return result;
      }
    );
  } catch (error) {
    if (error instanceof DepartureDeleteOperationAbortError) {
      return error.result;
    }

    throw error;
  }
}

/**
 * Creates the public departure write facade consumed by feature hooks.
 */
export function createDepartureComposition(): DepartureComposition {
  const arrivalRepository = new ArrivalRepository(appDb.arrivals);
  const departureRepository = new DepartureRepository(appDb.departures);
  const supplierRepository = new SupplierRepository(appDb.suppliers);
  const categoryRepository = new CategoryRepository(appDb.categories);
  const productRepository = new ProductRepository(appDb.products);
  const recordCodeRepository = new RecordCodeRepository(appDb.recordCodes);
  const createDepartureServiceImpl = new CreateDepartureService();
  const updateDepartureServiceImpl = new UpdateDepartureService();
  const deleteDepartureServiceImpl = new DeleteDepartureService();
  const createDepartureDependencies: CreateDepartureDependencies = {
    departureRepository,
    arrivalRepository,
    supplierRepository,
    categoryRepository,
    productRepository,
    recordCodeRepository,
  };
  const deleteDepartureDependencies: DeleteDepartureDependencies = {
    departureRepository,
    recordCodeRepository,
  };
  const updateDepartureDependencies: UpdateDepartureDependencies = {
    departureRepository,
    arrivalRepository,
    supplierRepository,
    categoryRepository,
    productRepository,
    recordCodeRepository,
  };

  return {
    createDepartureDependencies,
    createDepartureService: {
      execute(input: CreateDepartureInput): Promise<CreateDepartureResult> {
        return runDepartureTransaction(() =>
          createDepartureServiceImpl.execute(input, createDepartureDependencies)
        );
      },
    },
    deleteDepartureService: {
      execute(input: DeleteDepartureInput): Promise<DeleteDepartureResult> {
        return runDepartureDeleteTransaction(() =>
          deleteDepartureServiceImpl.execute(input, deleteDepartureDependencies)
        );
      },
    },
    updateDepartureService: {
      execute(input: UpdateDepartureInput): Promise<UpdateDepartureResult> {
        return runDepartureTransaction(() =>
          updateDepartureServiceImpl.execute(input, updateDepartureDependencies)
        );
      },
    },
  };
}
