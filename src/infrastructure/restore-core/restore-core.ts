/**
 * Generic restore mode understood by the reusable restore core.
 */
export type RestoreMode = 'overwrite' | 'merge' | 'rebase';

/**
 * Generic conflict code produced by the reusable restore core.
 */
export type RestoreConflictCode = 'MERGE_CONFLICT' | 'REBASE_CONFLICT';

/**
 * Generic keyed-record conflict produced by the reusable restore core.
 */
export interface RestoreConflict<TTableName extends string = string> {
  readonly table: TTableName;
  readonly recordId: string;
  readonly path: string;
  readonly code: RestoreConflictCode;
  readonly message: string;
}

/**
 * Stable JSON-like stringify used for deterministic record comparisons.
 *
 * Non-goal:
 * - not intended as a general serializer for transport or persistence
 */
export function stableStringify(value: unknown): string {
  if (value === null || typeof value !== 'object') {
    return JSON.stringify(value);
  }

  if (Array.isArray(value)) {
    return `[${value.map((item) => stableStringify(item)).join(',')}]`;
  }

  const entries = Object.entries(value as Record<string, unknown>).sort(
    ([leftKey], [rightKey]) => leftKey.localeCompare(rightKey)
  );

  return `{${entries
    .map(
      ([key, entryValue]) =>
        `${JSON.stringify(key)}:${stableStringify(entryValue)}`
    )
    .join(',')}}`;
}

/**
 * Builds the target record set for a keyed table according to restore mode.
 */
export function buildTargetRecords<TRecord>(
  currentRecords: readonly TRecord[],
  importedRecords: readonly TRecord[],
  mode: RestoreMode,
  getKey: (record: TRecord) => string
): TRecord[] {
  if (mode === 'overwrite') {
    return [...importedRecords];
  }

  if (mode === 'merge') {
    return [
      ...currentRecords.filter(
        (record) =>
          !importedRecords.some(
            (importedRecord) => getKey(importedRecord) === getKey(record)
          )
      ),
      ...importedRecords,
    ];
  }

  return [
    ...importedRecords.filter(
      (record) =>
        !currentRecords.some(
          (currentRecord) => getKey(currentRecord) === getKey(record)
        )
    ),
    ...currentRecords,
  ];
}

/**
 * Compares keyed records and emits generic merge/rebase conflicts.
 */
export function compareRestoreRecords<
  TRecord,
  TTableName extends string = string,
>(
  currentRecords: readonly TRecord[],
  importedRecords: readonly TRecord[],
  mode: RestoreMode,
  getKey: (record: TRecord) => string,
  table: TTableName
): RestoreConflict<TTableName>[] {
  if (mode === 'overwrite') {
    return [];
  }

  const currentById = new Map(
    currentRecords.map((record) => [getKey(record), record])
  );
  const code = mode === 'merge' ? 'MERGE_CONFLICT' : 'REBASE_CONFLICT';

  return importedRecords.flatMap((importedRecord) => {
    const recordKey = getKey(importedRecord);
    const currentRecord = currentById.get(recordKey);

    if (
      !currentRecord ||
      stableStringify(currentRecord) === stableStringify(importedRecord)
    ) {
      return [];
    }

    return [
      {
        table,
        recordId: recordKey,
        path: `${table}/${recordKey}`,
        code,
        message:
          mode === 'merge'
            ? `Imported ${table} record ${recordKey} will replace the current record`
            : `Current ${table} record ${recordKey} will remain after rebasing`,
      },
    ];
  });
}
