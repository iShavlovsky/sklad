import { z } from 'zod';

import { mapZodIssues } from '@/domain/validation/map-zod-issues.ts';
import type { ValidationIssue } from '@/domain/validation/validation-issue.ts';
import { nowIso } from '@/shared/utils/time.ts';

import type { SettingRecord } from '../setting.record.ts';

const saveSettingSchema = z.object({
  key: z.string().trim().min(1),
  value: z.unknown(),
});

const deleteSettingSchema = z.object({
  key: z.string().trim().min(1),
});

export interface SettingRepositoryPort {
  getByKey(key: string): Promise<SettingRecord | undefined>;
  put(record: SettingRecord): Promise<string>;
  delete(key: string): Promise<void>;
  list(): Promise<SettingRecord[]>;
}

export interface SaveSettingInput {
  key: string;
  value: unknown;
}

export type SaveSettingResult =
  | {
      ok: true;
      action: 'created' | 'updated';
      setting: SettingRecord;
    }
  | {
      ok: false;
      code: 'VALIDATION_ERROR';
      issues: ValidationIssue[];
    }
  | {
      ok: false;
      code: 'DB_WRITE_FAILED';
    };

export interface DeleteSettingInput {
  key: string;
}

export type DeleteSettingResult =
  | {
      ok: true;
      deletedKey: string;
    }
  | {
      ok: false;
      code: 'VALIDATION_ERROR';
      issues: ValidationIssue[];
    }
  | {
      ok: false;
      code: 'SETTING_NOT_FOUND';
    }
  | {
      ok: false;
      code: 'DB_WRITE_FAILED';
    };

export class SaveSettingService {
  public async execute(
    input: SaveSettingInput,
    dependencies: SettingRepositoryPort
  ): Promise<SaveSettingResult> {
    const parsed = saveSettingSchema.safeParse(input);
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
      const existing = await dependencies.getByKey(data.key);
      const setting: SettingRecord = {
        key: data.key,
        value: data.value,
        updatedAt: timestamp,
      };

      await dependencies.put(setting);

      return {
        ok: true,
        action: existing === undefined ? 'created' : 'updated',
        setting,
      };
    } catch {
      return {
        ok: false,
        code: 'DB_WRITE_FAILED',
      };
    }
  }
}

export class DeleteSettingService {
  public async execute(
    input: DeleteSettingInput,
    dependencies: SettingRepositoryPort
  ): Promise<DeleteSettingResult> {
    const parsed = deleteSettingSchema.safeParse(input);
    if (!parsed.success) {
      return {
        ok: false,
        code: 'VALIDATION_ERROR',
        issues: mapZodIssues(parsed.error.issues),
      };
    }

    const { data } = parsed;

    try {
      const existing = await dependencies.getByKey(data.key);
      if (existing === undefined) {
        return {
          ok: false,
          code: 'SETTING_NOT_FOUND',
        };
      }

      await dependencies.delete(data.key);

      return {
        ok: true,
        deletedKey: data.key,
      };
    } catch {
      return {
        ok: false,
        code: 'DB_WRITE_FAILED',
      };
    }
  }
}
