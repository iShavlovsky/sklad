import { mapZodIssues } from '@/domain/validation/map-zod-issues.ts';

import type { DeleteDepartureInput } from './delete-departure.input.ts';
import type { DeleteDepartureDependencies } from './delete-departure.ports.ts';
import type { DeleteDepartureResult } from './delete-departure.result.ts';
import { deleteDepartureInputSchema } from './delete-departure.schema.ts';

export class DeleteDepartureService {
  public async execute(
    input: DeleteDepartureInput,
    dependencies: DeleteDepartureDependencies
  ): Promise<DeleteDepartureResult> {
    const parsed = deleteDepartureInputSchema.safeParse(input);

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

      await dependencies.recordCodeRepository.deleteOwnerCodes(
        'departure',
        existing.id
      );
      await dependencies.departureRepository.delete(existing.id);

      return {
        ok: true,
        id: existing.id,
      } satisfies DeleteDepartureResult;
    } catch {
      return {
        ok: false,
        code: 'DB_WRITE_FAILED',
      };
    }
  }
}
