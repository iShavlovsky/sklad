import type { AppBackupPayload } from '@/domain/backup';

/**
 * Successful JSON parse result used by reusable serialization callers.
 */
export interface JsonParseSuccess {
  readonly ok: true;
  readonly value: unknown;
}

/**
 * Failed JSON parse result used by reusable serialization callers.
 */
export interface JsonParseFailure {
  readonly ok: false;
  readonly code: 'INVALID_JSON';
  readonly message: string;
  readonly details: string | null;
}

/**
 * Result union for parsing untrusted JSON text.
 */
export type JsonParseResult = JsonParseSuccess | JsonParseFailure;

/**
 * Reusable infrastructure JSON engine used by backup and any future technical
 * serialization flows.
 *
 * Non-goal:
 * - does not own file I/O or payload validation beyond JSON parsing
 */
export interface JsonEngine {
  serialize(payload: AppBackupPayload): string;
  parse(jsonText: string): JsonParseResult;
}

/**
 * Default JSON engine implementation based on built-in browser/runtime JSON.
 */
export class DefaultJsonEngine implements JsonEngine {
  public serialize(payload: AppBackupPayload): string {
    return JSON.stringify(payload);
  }

  public parse(jsonText: string): JsonParseResult {
    try {
      const value: unknown = JSON.parse(jsonText);

      return {
        ok: true,
        value,
      };
    } catch (error) {
      return {
        ok: false,
        code: 'INVALID_JSON',
        message: 'Backup JSON could not be parsed',
        details: error instanceof Error ? error.message : String(error),
      };
    }
  }
}

/**
 * Factory for the reusable JSON engine.
 */
export function createJsonEngine(): JsonEngine {
  return new DefaultJsonEngine();
}
