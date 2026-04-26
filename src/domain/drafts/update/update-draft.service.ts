import { mapZodIssues } from '@/domain/validation/map-zod-issues.ts';
import { nowIso } from '@/shared/utils/time.ts';

import {
  buildDraftRecord,
  createDraftRecordCodes,
} from '../write/draft-write.ts';

import type { UpdateDraftInput } from './update-draft.input.ts';
import type { UpdateDraftDependencies } from './update-draft.ports.ts';
import type { UpdateDraftResult } from './update-draft.result.ts';
import { updateDraftInputSchema } from './update-draft.schema.ts';

export class UpdateDraftService {
  public async execute(
    input: UpdateDraftInput,
    dependencies: UpdateDraftDependencies
  ): Promise<UpdateDraftResult> {
    const parsed = updateDraftInputSchema.safeParse(input);

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

      const timestamp = nowIso();
      const record = buildDraftRecord({
        id: existing.id,
        kind: data.kind,
        title: data.title,
        payload: data.payload,
        createdAt: existing.createdAt,
        updatedAt: timestamp,
      });

      await dependencies.draftRepository.put(record);

      const recordCodes = createDraftRecordCodes(
        record.id,
        timestamp,
        record.payload.codes
      );

      await dependencies.recordCodeRepository.replaceOwnerCodes(
        'draft',
        record.id,
        recordCodes
      );

      return {
        ok: true,
        record,
      } satisfies UpdateDraftResult;
    } catch {
      return {
        ok: false,
        code: 'DB_WRITE_FAILED',
      };
    }
  }
}
