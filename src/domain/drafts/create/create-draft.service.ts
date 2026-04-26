import { mapZodIssues } from '@/domain/validation/map-zod-issues.ts';
import { createId } from '@/shared/utils/create-id.ts';
import { nowIso } from '@/shared/utils/time.ts';

import {
  buildDraftRecord,
  createDraftRecordCodes,
} from '../write/draft-write.ts';

import type { CreateDraftInput } from './create-draft.input.ts';
import type { CreateDraftDependencies } from './create-draft.ports.ts';
import type { CreateDraftResult } from './create-draft.result.ts';
import { createDraftInputSchema } from './create-draft.schema.ts';

export class CreateDraftService {
  public async execute(
    input: CreateDraftInput,
    dependencies: CreateDraftDependencies
  ): Promise<CreateDraftResult> {
    const parsed = createDraftInputSchema.safeParse(input);

    if (!parsed.success) {
      return {
        ok: false,
        code: 'VALIDATION_ERROR',
        issues: mapZodIssues(parsed.error.issues),
      };
    }

    const { data } = parsed;

    try {
      const timestamp = nowIso();
      const record = buildDraftRecord({
        id: createId(),
        kind: data.kind,
        title: data.title,
        payload: data.payload,
        createdAt: timestamp,
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
      } satisfies CreateDraftResult;
    } catch {
      return {
        ok: false,
        code: 'DB_WRITE_FAILED',
      };
    }
  }
}
