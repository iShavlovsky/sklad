import { mapZodIssues } from '@/domain/validation/map-zod-issues.ts';

import type { DeleteDraftInput } from './delete-draft.input.ts';
import type { DeleteDraftDependencies } from './delete-draft.ports.ts';
import type { DeleteDraftResult } from './delete-draft.result.ts';
import { deleteDraftInputSchema } from './delete-draft.schema.ts';

export class DeleteDraftService {
  public async execute(
    input: DeleteDraftInput,
    dependencies: DeleteDraftDependencies
  ): Promise<DeleteDraftResult> {
    const parsed = deleteDraftInputSchema.safeParse(input);

    if (!parsed.success) {
      return {
        ok: false,
        code: 'VALIDATION_ERROR',
        issues: mapZodIssues(parsed.error.issues),
      };
    }

    const { data } = parsed;

    try {
      const existing = await dependencies.draftRepository.getById(data.id);
      if (existing === undefined) {
        return {
          ok: false,
          code: 'DRAFT_NOT_FOUND',
          id: data.id,
        };
      }

      await dependencies.recordCodeRepository.deleteOwnerCodes(
        'draft',
        existing.id
      );
      await dependencies.draftRepository.delete(existing.id);

      return {
        ok: true,
        id: existing.id,
      } satisfies DeleteDraftResult;
    } catch {
      return {
        ok: false,
        code: 'DB_WRITE_FAILED',
      };
    }
  }
}
