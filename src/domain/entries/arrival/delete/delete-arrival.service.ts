import { mapZodIssues } from '@/domain/validation/map-zod-issues.ts';

import type { DeleteArrivalInput } from './delete-arrival.input.ts';
import type { DeleteArrivalDependencies } from './delete-arrival.ports.ts';
import type { DeleteArrivalResult } from './delete-arrival.result.ts';
import { deleteArrivalInputSchema } from './delete-arrival.schema.ts';

export class DeleteArrivalService {
  public async execute(
    input: DeleteArrivalInput,
    dependencies: DeleteArrivalDependencies
  ): Promise<DeleteArrivalResult> {
    const parsed = deleteArrivalInputSchema.safeParse(input);

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

      const departureCount =
        await dependencies.departureRepository.countByBasedOnArrivalId(
          existing.id
        );
      if (departureCount > 0) {
        return {
          ok: false,
          code: 'ARRIVAL_HAS_DEPENDENT_DEPARTURES',
          id: existing.id,
          departureCount,
        };
      }

      await dependencies.recordCodeRepository.deleteOwnerCodes(
        'arrival',
        existing.id
      );
      await dependencies.arrivalRepository.delete(existing.id);

      return {
        ok: true,
        id: existing.id,
      } satisfies DeleteArrivalResult;
    } catch {
      return {
        ok: false,
        code: 'DB_WRITE_FAILED',
      };
    }
  }
}
