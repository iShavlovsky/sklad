import { z } from 'zod';

import { mapZodIssues } from '@/domain/validation/map-zod-issues.ts';
import type { ValidationIssue } from '@/domain/validation/validation-issue.ts';
import { createId } from '@/shared/utils/create-id.ts';
import { nowIso } from '@/shared/utils/time.ts';

import type { FavoriteRecord } from '../favorite.record.ts';

const saveFavoriteSchema = z.object({
  id: z.string().trim().min(1).optional(),
  label: z.string().trim().min(1),
  route: z.string().trim().min(1),
  icon: z.string().trim().min(1).nullable(),
  order: z.number().int(),
});

const deleteFavoriteSchema = z.object({
  id: z.string().trim().min(1),
});

export interface FavoriteRepositoryPort {
  getById(id: string): Promise<FavoriteRecord | undefined>;
  put(record: FavoriteRecord): Promise<string>;
  delete(id: string): Promise<void>;
  list(): Promise<FavoriteRecord[]>;
}

export interface SaveFavoriteInput {
  id?: string;
  label: string;
  route: string;
  icon: string | null;
  order: number;
}

export type SaveFavoriteResult =
  | {
      ok: true;
      action: 'created' | 'updated';
      favorite: FavoriteRecord;
    }
  | {
      ok: false;
      code: 'VALIDATION_ERROR';
      issues: ValidationIssue[];
    }
  | {
      ok: false;
      code: 'FAVORITE_NOT_FOUND';
    }
  | {
      ok: false;
      code: 'DB_WRITE_FAILED';
    };

export interface DeleteFavoriteInput {
  id: string;
}

export type DeleteFavoriteResult =
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
      code: 'FAVORITE_NOT_FOUND';
    }
  | {
      ok: false;
      code: 'DB_WRITE_FAILED';
    };

export class SaveFavoriteService {
  public async execute(
    input: SaveFavoriteInput,
    dependencies: FavoriteRepositoryPort
  ): Promise<SaveFavoriteResult> {
    const parsed = saveFavoriteSchema.safeParse(input);
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
        if (existing !== undefined) {
          const favorite: FavoriteRecord = {
            ...existing,
            label: data.label,
            route: data.route,
            icon: data.icon,
            order: data.order,
            updatedAt: timestamp,
          };

          await dependencies.put(favorite);

          return {
            ok: true,
            action: 'updated',
            favorite,
          };
        }

        const favorite: FavoriteRecord = {
          id: data.id,
          label: data.label,
          route: data.route,
          icon: data.icon,
          order: data.order,
          createdAt: timestamp,
          updatedAt: timestamp,
        };

        await dependencies.put(favorite);

        return {
          ok: true,
          action: 'created',
          favorite,
        };
      }

      const favorite: FavoriteRecord = {
        id: createId(),
        label: data.label,
        route: data.route,
        icon: data.icon,
        order: data.order,
        createdAt: timestamp,
        updatedAt: timestamp,
      };

      await dependencies.put(favorite);

      return {
        ok: true,
        action: 'created',
        favorite,
      };
    } catch {
      return {
        ok: false,
        code: 'DB_WRITE_FAILED',
      };
    }
  }
}

export class DeleteFavoriteService {
  public async execute(
    input: DeleteFavoriteInput,
    dependencies: FavoriteRepositoryPort
  ): Promise<DeleteFavoriteResult> {
    const parsed = deleteFavoriteSchema.safeParse(input);
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
          code: 'FAVORITE_NOT_FOUND',
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
