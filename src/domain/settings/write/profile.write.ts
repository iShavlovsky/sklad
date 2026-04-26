import { z } from 'zod';

import { mapZodIssues } from '@/domain/validation/map-zod-issues.ts';
import type { ValidationIssue } from '@/domain/validation/validation-issue.ts';
import { createId } from '@/shared/utils/create-id.ts';
import { nowIso } from '@/shared/utils/time.ts';

import type { ProfileRecord } from '../profile.record.ts';

const saveProfileSchema = z.object({
  id: z.string().trim().min(1).optional(),
  displayName: z.string().trim().min(1),
});

const deleteProfileSchema = z.object({
  id: z.string().trim().min(1),
});

export interface ProfileRepositoryPort {
  getById(id: string): Promise<ProfileRecord | undefined>;
  put(record: ProfileRecord): Promise<string>;
  delete(id: string): Promise<void>;
  list(): Promise<ProfileRecord[]>;
}

export interface SaveProfileInput {
  id?: string;
  displayName: string;
}

export type SaveProfileResult =
  | {
      ok: true;
      action: 'created' | 'updated';
      profile: ProfileRecord;
    }
  | {
      ok: false;
      code: 'VALIDATION_ERROR';
      issues: ValidationIssue[];
    }
  | {
      ok: false;
      code: 'PROFILE_NOT_FOUND';
    }
  | {
      ok: false;
      code: 'DB_WRITE_FAILED';
    };

export interface DeleteProfileInput {
  id: string;
}

export type DeleteProfileResult =
  | {
      ok: true;
      deletedId: string;
    }
  | {
      ok: false;
      code: 'VALIDATION_ERROR';
      issues: ValidationIssue[];
    }
  | {
      ok: false;
      code: 'PROFILE_NOT_FOUND';
    }
  | {
      ok: false;
      code: 'DB_WRITE_FAILED';
    };

export class SaveProfileService {
  public async execute(
    input: SaveProfileInput,
    dependencies: ProfileRepositoryPort
  ): Promise<SaveProfileResult> {
    const parsed = saveProfileSchema.safeParse(input);
    if (!parsed.success) {
      return {
        ok: false,
        code: 'VALIDATION_ERROR',
        issues: mapZodIssues(parsed.error.issues),
      };
    }

    const { data } = parsed;
    const timestamp = nowIso();

    try {
      if (data.id !== undefined) {
        const existing = await dependencies.getById(data.id);
        if (existing === undefined) {
          return {
            ok: false,
            code: 'PROFILE_NOT_FOUND',
          };
        }

        const profile: ProfileRecord = {
          ...existing,
          displayName: data.displayName,
          updatedAt: timestamp,
        };

        await dependencies.put(profile);

        return {
          ok: true,
          action: 'updated',
          profile,
        };
      }

      const profile: ProfileRecord = {
        id: createId(),
        displayName: data.displayName,
        createdAt: timestamp,
        updatedAt: timestamp,
      };

      await dependencies.put(profile);

      return {
        ok: true,
        action: 'created',
        profile,
      };
    } catch {
      return {
        ok: false,
        code: 'DB_WRITE_FAILED',
      };
    }
  }
}

export class DeleteProfileService {
  public async execute(
    input: DeleteProfileInput,
    dependencies: ProfileRepositoryPort
  ): Promise<DeleteProfileResult> {
    const parsed = deleteProfileSchema.safeParse(input);
    if (!parsed.success) {
      return {
        ok: false,
        code: 'VALIDATION_ERROR',
        issues: mapZodIssues(parsed.error.issues),
      };
    }

    const { data } = parsed;

    try {
      const existing = await dependencies.getById(data.id);
      if (existing === undefined) {
        return {
          ok: false,
          code: 'PROFILE_NOT_FOUND',
        };
      }

      await dependencies.delete(data.id);

      return {
        ok: true,
        deletedId: data.id,
      };
    } catch {
      return {
        ok: false,
        code: 'DB_WRITE_FAILED',
      };
    }
  }
}
