import { mapZodIssues } from '@/domain/validation/map-zod-issues.ts';
import { createId } from '@/shared/utils/create-id.ts';
import { nowIso } from '@/shared/utils/time.ts';

import {
  buildArrivalRecord,
  createArrivalRecordCodes,
  isArrivalDirectoryResolveFailure,
  resolveArrivalDirectory,
} from '../write/arrival-write.ts';

import type { CreateArrivalInput } from './create-arrival.input.ts';
import type { CreateArrivalDependencies } from './create-arrival.ports.ts';
import type { CreateArrivalResult } from './create-arrival.result.ts';
import { createArrivalInputSchema } from './create-arrival.schema.ts';

/**
 * Validates and materializes a new arrival record for the first-data stack.
 *
 * Role:
 * - owns domain-level arrival creation semantics
 * - resolves directory references through injected repositories
 * - writes only through supplied dependencies
 *
 * Non-goals:
 * - no Dexie transaction ownership
 * - no UI orchestration
 */
export class CreateArrivalService {
  public async execute(
    input: CreateArrivalInput,
    dependencies: CreateArrivalDependencies
  ): Promise<CreateArrivalResult> {
    const parsed = createArrivalInputSchema.safeParse(input);

    if (!parsed.success) {
      return {
        ok: false,
        code: 'VALIDATION_ERROR',
        issues: mapZodIssues(parsed.error.issues),
      };
    }

    const { data } = parsed;

    try {
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
        id: createId(),
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
        originDraftId: data.originDraftId,
        originKind: data.originDraftId ? 'draft' : 'manual',
        createdAt: timestamp,
        updatedAt: timestamp,
      });

      const recordCodes = createArrivalRecordCodes(
        record.id,
        timestamp,
        data.codes
      );
      for (const code of recordCodes) {
        const existingCodes =
          await dependencies.recordCodeRepository.findByNormalizedValue(
            code.normalizedValue
          );

        if (existingCodes.length > 0) {
          return {
            ok: false,
            code: 'VALIDATION_ERROR',
            issues: [
              {
                path: 'codes',
                code: 'custom',
                message: 'Код уже используется в другой записи.',
              },
            ],
          };
        }
      }

      await dependencies.arrivalRepository.put(record);

      await dependencies.recordCodeRepository.replaceOwnerCodes(
        'arrival',
        record.id,
        recordCodes
      );

      return {
        ok: true,
        record,
      } satisfies CreateArrivalResult;
    } catch {
      return {
        ok: false,
        code: 'DB_WRITE_FAILED',
      };
    }
  }
}
