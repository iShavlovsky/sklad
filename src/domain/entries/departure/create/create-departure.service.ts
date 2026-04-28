import { mapZodIssues } from '@/domain/validation/map-zod-issues.ts';
import { createId } from '@/shared/utils/create-id.ts';
import { nowIso } from '@/shared/utils/time.ts';

import {
  buildDepartureRecord,
  createDepartureRecordCodes,
  isDepartureDirectoryResolveFailure,
  resolveDepartureDirectory,
} from '../write/departure-write.ts';

import type { CreateDepartureInput } from './create-departure.input.ts';
import type { CreateDepartureDependencies } from './create-departure.ports.ts';
import type { CreateDepartureResult } from './create-departure.result.ts';
import { createDepartureInputSchema } from './create-departure.schema.ts';

export class CreateDepartureService {
  public async execute(
    input: CreateDepartureInput,
    dependencies: CreateDepartureDependencies
  ): Promise<CreateDepartureResult> {
    const parsed = createDepartureInputSchema.safeParse(input);

    if (!parsed.success) {
      return {
        ok: false,
        code: 'VALIDATION_ERROR',
        issues: mapZodIssues(parsed.error.issues),
      };
    }

    const { data } = parsed;

    try {
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
        id: createId(),
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
        originDraftId: data.originDraftId,
        originKind: linkedArrivalId
          ? 'linked-arrival'
          : data.originDraftId
            ? 'draft'
            : 'manual',
        createdAt: timestamp,
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
      } satisfies CreateDepartureResult;
    } catch {
      return {
        ok: false,
        code: 'DB_WRITE_FAILED',
      };
    }
  }
}
