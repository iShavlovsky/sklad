import { mapZodIssues } from '@/domain/validation/map-zod-issues.ts';
import { createId } from '@/shared/utils/create-id.ts';
import { nowIso } from '@/shared/utils/time.ts';

import {
  buildDepartureRecord,
  createDepartureRecordCodes,
  isDepartureDirectoryResolveFailure,
  resolveDepartureDirectory,
} from '../write/departure-write.ts';

import type { UpdateDepartureInput } from './update-departure.input.ts';
import type { UpdateDepartureDependencies } from './update-departure.ports.ts';
import type { UpdateDepartureResult } from './update-departure.result.ts';
import { updateDepartureInputSchema } from './update-departure.schema.ts';

export class UpdateDepartureService {
  public async execute(
    input: UpdateDepartureInput,
    dependencies: UpdateDepartureDependencies
  ): Promise<UpdateDepartureResult> {
    const parsed = updateDepartureInputSchema.safeParse(input);

    if (!parsed.success) {
      return {
        ok: false,
        code: 'VALIDATION_ERROR',
        issues: mapZodIssues(parsed.error.issues),
      };
    }

    const { data } = parsed;

    try {
      const existing = await dependencies.departureRepository.getById(data.id);
      if (existing === undefined) {
        return {
          ok: false,
          code: 'DEPARTURE_NOT_FOUND',
          id: data.id,
        };
      }

      let linkedArrivalId: string | null = null;
      if (data.basedOnArrivalId !== null) {
        const linkedArrival = await dependencies.arrivalRepository.getById(
          data.basedOnArrivalId
        );
        if (linkedArrival === undefined) {
          return {
            ok: false,
            code: 'LINKED_ARRIVAL_RESOLVE_FAILED',
            field: 'basedOnArrivalId',
            reason: 'not-found',
            arrivalId: data.basedOnArrivalId,
          };
        }

        linkedArrivalId = linkedArrival.id;
      }

      const supplierResult = await resolveDepartureDirectory(
        'supplier',
        dependencies.supplierRepository,
        data.supplier,
        (normalizedName, timestamp, name) => ({
          id: createId(),
          name,
          normalizedName,
          note: null,
          isArchived: false,
          createdAt: timestamp,
          updatedAt: timestamp,
        })
      );
      if (isDepartureDirectoryResolveFailure(supplierResult)) {
        return supplierResult;
      }
      const supplier = supplierResult;

      const categoryResult = await resolveDepartureDirectory(
        'category',
        dependencies.categoryRepository,
        data.category,
        (normalizedName, timestamp, name) => ({
          id: createId(),
          name,
          normalizedName,
          note: null,
          isArchived: false,
          createdAt: timestamp,
          updatedAt: timestamp,
        })
      );
      if (isDepartureDirectoryResolveFailure(categoryResult)) {
        return categoryResult;
      }
      const category = categoryResult;

      const productResult = await resolveDepartureDirectory(
        'product',
        dependencies.productRepository,
        data.product,
        (normalizedName, timestamp, name) => ({
          id: createId(),
          name,
          normalizedName,
          supplierId: supplier?.id ?? null,
          categoryId: category?.id ?? null,
          note: null,
          isArchived: false,
          createdAt: timestamp,
          updatedAt: timestamp,
        })
      );
      if (isDepartureDirectoryResolveFailure(productResult)) {
        return productResult;
      }
      const product = productResult;

      const timestamp = nowIso();
      const record = buildDepartureRecord({
        id: existing.id,
        subjectKind: data.subjectKind,
        title: data.title,
        description: data.description,
        occurredAt: data.occurredAt,
        money: data.money,
        quantityCost: data.quantityCost,
        note: data.note,
        direction: data.direction,
        supplier: {
          id: supplier?.id ?? null,
          name: supplier?.name ?? data.supplier.name ?? null,
        },
        product: {
          id: product?.id ?? null,
          name: product?.name ?? data.product.name ?? null,
        },
        category: {
          id: category?.id ?? null,
          name: category?.name ?? data.category.name ?? null,
        },
        mode: data.mode,
        basedOnArrivalId: linkedArrivalId,
        originDraftId: existing.originDraftId,
        originKind: existing.originKind,
        createdAt: existing.createdAt,
        updatedAt: timestamp,
      });

      await dependencies.departureRepository.put(record);

      const recordCodes = createDepartureRecordCodes(
        record.id,
        timestamp,
        data.codes
      );

      await dependencies.recordCodeRepository.replaceOwnerCodes(
        'departure',
        record.id,
        recordCodes
      );

      return {
        ok: true,
        record,
      } satisfies UpdateDepartureResult;
    } catch {
      return {
        ok: false,
        code: 'DB_WRITE_FAILED',
      };
    }
  }
}
