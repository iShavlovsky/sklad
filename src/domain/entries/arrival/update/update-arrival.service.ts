import { mapZodIssues } from '@/domain/validation/map-zod-issues.ts';
import { createId } from '@/shared/utils/create-id.ts';
import { nowIso } from '@/shared/utils/time.ts';

import {
  buildArrivalRecord,
  createArrivalRecordCodes,
  isArrivalDirectoryResolveFailure,
  resolveArrivalDirectory,
} from '../write/arrival-write.ts';

import type { UpdateArrivalInput } from './update-arrival.input.ts';
import type { UpdateArrivalDependencies } from './update-arrival.ports.ts';
import type { UpdateArrivalResult } from './update-arrival.result.ts';
import { updateArrivalInputSchema } from './update-arrival.schema.ts';

export class UpdateArrivalService {
  public async execute(
    input: UpdateArrivalInput,
    dependencies: UpdateArrivalDependencies
  ): Promise<UpdateArrivalResult> {
    const parsed = updateArrivalInputSchema.safeParse(input);

    if (!parsed.success) {
      return {
        ok: false,
        code: 'VALIDATION_ERROR',
        issues: mapZodIssues(parsed.error.issues),
      };
    }

    const { data } = parsed;

    try {
      const existing = await dependencies.arrivalRepository.getById(data.id);
      if (existing === undefined) {
        return {
          ok: false,
          code: 'ARRIVAL_NOT_FOUND',
          id: data.id,
        };
      }

      const supplierResult = await resolveArrivalDirectory(
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
      if (isArrivalDirectoryResolveFailure(supplierResult)) {
        return supplierResult;
      }
      const supplier = supplierResult;

      const categoryResult = await resolveArrivalDirectory(
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
      if (isArrivalDirectoryResolveFailure(categoryResult)) {
        return categoryResult;
      }
      const category = categoryResult;

      const productResult = await resolveArrivalDirectory(
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
      if (isArrivalDirectoryResolveFailure(productResult)) {
        return productResult;
      }
      const product = productResult;

      const timestamp = nowIso();
      const record = buildArrivalRecord({
        id: existing.id,
        subjectKind: data.subjectKind,
        title: data.title,
        description: data.description,
        occurredAt: data.occurredAt,
        money: data.money,
        quantityCost: data.quantityCost,
        linkUrl: data.linkUrl,
        note: data.note,
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
        originDraftId: existing.originDraftId,
        originKind: existing.originKind,
        createdAt: existing.createdAt,
        updatedAt: timestamp,
      });

      await dependencies.arrivalRepository.put(record);

      const recordCodes = createArrivalRecordCodes(
        record.id,
        timestamp,
        data.codes
      );

      await dependencies.recordCodeRepository.replaceOwnerCodes(
        'arrival',
        record.id,
        recordCodes
      );

      return {
        ok: true,
        record,
      } satisfies UpdateArrivalResult;
    } catch {
      return {
        ok: false,
        code: 'DB_WRITE_FAILED',
      };
    }
  }
}
