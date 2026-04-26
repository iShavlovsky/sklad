import type { BackupExportOutput } from '@/domain/backup';
import {
  createJsonEngine,
  type JsonEngine,
  type JsonParseFailure,
  type JsonParseSuccess,
} from '@/infrastructure/serialization/json.engine.ts';

export const BACKUP_JSON_MIME_TYPE = 'application/json' as const;

/**
 * Input required to serialize and download a canonical backup export.
 */
export interface BackupBrowserFileExportInput {
  readonly output: BackupExportOutput;
  readonly fileName?: string | null;
}

/**
 * Successful browser download result for a backup export.
 */
export interface BackupBrowserFileExportSuccess {
  readonly ok: true;
  readonly fileName: string;
  readonly byteLength: number;
  readonly transport: 'anchor-download';
  readonly mimeType: typeof BACKUP_JSON_MIME_TYPE;
}

/**
 * Failed browser download result for a backup export.
 */
export interface BackupBrowserFileExportFailure {
  readonly ok: false;
  readonly code: 'BROWSER_UNAVAILABLE' | 'SAVE_FAILED';
  readonly message: string;
  readonly details: string | null;
}

/**
 * Export union returned by the reusable browser file adapter.
 */
export type BackupBrowserFileExportResult =
  | BackupBrowserFileExportSuccess
  | BackupBrowserFileExportFailure;

/**
 * Successful file-read result for a candidate backup import.
 */
export interface BackupBrowserFileImportSuccess {
  readonly ok: true;
  readonly sourceName: string | null;
  readonly text: string;
  readonly textLength: number;
  readonly parse: JsonParseSuccess;
  readonly candidate: unknown;
}

/**
 * Failed file-read or parse result for a candidate backup import.
 */
export interface BackupBrowserFileImportFailure {
  readonly ok: false;
  readonly sourceName: string | null;
  readonly code: 'READ_FAILED' | JsonParseFailure['code'];
  readonly message: string;
  readonly details: string | null;
}

/**
 * Import union returned by the reusable browser file adapter.
 */
export type BackupBrowserFileImportResult =
  | BackupBrowserFileImportSuccess
  | BackupBrowserFileImportFailure;

/**
 * Reusable browser file adapter for text-based import/export flows.
 *
 * Current capabilities:
 * - save canonical backup JSON through anchor download
 * - read file text
 * - parse text through the reusable JSON engine
 *
 * Non-goals:
 * - no backup payload validation
 * - no `showSaveFilePicker()` dependency
 */
export interface BackupBrowserFileAdapter {
  saveExport(
    input: BackupBrowserFileExportInput
  ): Promise<BackupBrowserFileExportResult>;
  readImportCandidateFromFile(
    file: File
  ): Promise<BackupBrowserFileImportResult>;
  readImportCandidateFromText(
    text: string,
    sourceName?: string | null
  ): BackupBrowserFileImportResult;
}

export interface BackupBrowserFileAdapterDependencies {
  readonly jsonEngine?: JsonEngine;
}

function createDefaultBackupFileName(
  exportedAt: string,
  version: number
): string {
  const safeTimestamp = exportedAt.replace(/[:.]/g, '-');

  return `sklad-backup-v${version}-${safeTimestamp}.json`;
}

function createReadFailure(
  sourceName: string | null,
  message: string,
  details: string | null
): BackupBrowserFileImportFailure {
  return {
    ok: false,
    sourceName,
    code: 'READ_FAILED',
    message,
    details,
  };
}

function toParseFailure(
  sourceName: string | null,
  parseFailure: JsonParseFailure
): BackupBrowserFileImportFailure {
  return {
    ok: false,
    sourceName,
    code: parseFailure.code,
    message: parseFailure.message,
    details: parseFailure.details,
  };
}

function triggerDownload(blob: Blob, fileName: string): void {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');

  try {
    anchor.href = url;
    anchor.download = fileName;
    anchor.rel = 'noopener';
    anchor.style.display = 'none';

    const parent = document.body ?? document.documentElement;
    parent.appendChild(anchor);
    anchor.click();
    anchor.remove();
  } finally {
    URL.revokeObjectURL(url);
  }
}

class DefaultBackupBrowserFileAdapter implements BackupBrowserFileAdapter {
  private readonly jsonEngine: JsonEngine;

  public constructor(jsonEngine: JsonEngine) {
    this.jsonEngine = jsonEngine;
  }

  public async saveExport(
    input: BackupBrowserFileExportInput
  ): Promise<BackupBrowserFileExportResult> {
    if (typeof document === 'undefined' || typeof URL === 'undefined') {
      return {
        ok: false,
        code: 'BROWSER_UNAVAILABLE',
        message: 'Backup export is only available in a browser context',
        details: null,
      };
    }

    try {
      const jsonText = this.jsonEngine.serialize(input.output.payload);
      const fileName =
        input.fileName ??
        createDefaultBackupFileName(
          input.output.report.exportedAt,
          input.output.report.version
        );
      const blob = new Blob([jsonText], { type: BACKUP_JSON_MIME_TYPE });

      triggerDownload(blob, fileName);

      return {
        ok: true,
        fileName,
        byteLength: blob.size,
        transport: 'anchor-download',
        mimeType: BACKUP_JSON_MIME_TYPE,
      };
    } catch (error) {
      return {
        ok: false,
        code: 'SAVE_FAILED',
        message: 'Backup export download failed',
        details: error instanceof Error ? error.message : String(error),
      };
    }
  }

  public async readImportCandidateFromFile(
    file: File
  ): Promise<BackupBrowserFileImportResult> {
    try {
      const text = await file.text();

      return this.readImportCandidateFromText(text, file.name);
    } catch (error) {
      return createReadFailure(
        file.name,
        'Backup file could not be read',
        error instanceof Error ? error.message : String(error)
      );
    }
  }

  public readImportCandidateFromText(
    text: string,
    sourceName: string | null = null
  ): BackupBrowserFileImportResult {
    const parsed = this.jsonEngine.parse(text);

    if (!parsed.ok) {
      return toParseFailure(sourceName, parsed);
    }

    return {
      ok: true,
      sourceName,
      text,
      textLength: text.length,
      parse: parsed,
      candidate: parsed.value,
    };
  }
}

/**
 * Factory for the reusable browser file adapter.
 */
export function createBackupBrowserFileAdapter(
  dependencies: BackupBrowserFileAdapterDependencies = {}
): BackupBrowserFileAdapter {
  return new DefaultBackupBrowserFileAdapter(
    dependencies.jsonEngine ?? createJsonEngine()
  );
}
