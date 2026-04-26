import {
  BrowserCodeReader,
  BrowserMultiFormatReader,
  type IBrowserCodeReaderOptions,
} from '@zxing/browser';

import type { ScannerPhotoCapabilityReport } from '../contracts/capability-report.ts';
import type { ScannerDecodeHints } from '../contracts/contracts.ts';
import {
  createScannerFatalFailure,
  createScannerFileTooLargeFailure,
  createScannerRecoverableFailure,
  type ScannerDecodeResult,
} from '../contracts/decode-result.ts';
import { createZxingDecodeHints } from '../zxing/decode-hints.ts';
import {
  createScannerResultFromZxingResult,
  mapZxingDecodeErrorToResult,
} from '../zxing/error-mapping.ts';

export interface DecodeScannerPhotoInput {
  readonly file: File;
  readonly decodeHints?: ScannerDecodeHints | null;
  readonly signal?: AbortSignal;
}

export interface PhotoScannerAdapter {
  getCapability(): Promise<ScannerPhotoCapabilityReport>;
  decodeFile(input: DecodeScannerPhotoInput): Promise<ScannerDecodeResult>;
}

export interface PhotoScannerAdapterOptions {
  readonly maxFileSizeBytes?: number;
  readonly acceptedMimeTypes?: readonly string[];
  readonly readerOptions?: IBrowserCodeReaderOptions;
}

const DEFAULT_MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;
const DEFAULT_ACCEPTED_MIME_TYPES = ['image/*'] as const;

function isBrowserAvailable(): boolean {
  return (
    typeof window !== 'undefined' &&
    typeof document !== 'undefined' &&
    typeof URL !== 'undefined' &&
    typeof Image !== 'undefined'
  );
}

function resolveAcceptedMimeTypes(
  mimeTypes?: readonly string[]
): readonly string[] {
  return mimeTypes !== undefined && mimeTypes.length > 0
    ? mimeTypes
    : DEFAULT_ACCEPTED_MIME_TYPES;
}

function supportsPhotoScanning(): boolean {
  return (
    isBrowserAvailable() &&
    typeof URL.createObjectURL === 'function' &&
    typeof URL.revokeObjectURL === 'function'
  );
}

function isAcceptedMimeType(
  file: File,
  acceptedMimeTypes: readonly string[]
): boolean {
  if (file.type.trim().length === 0) {
    return true;
  }

  const normalizedType = file.type.toLowerCase();

  return acceptedMimeTypes.some((acceptedMimeType) => {
    const normalizedAcceptedMimeType = acceptedMimeType.toLowerCase();

    if (normalizedAcceptedMimeType.endsWith('/*')) {
      const prefix = normalizedAcceptedMimeType.slice(0, -1);

      return normalizedType.startsWith(prefix);
    }

    return normalizedType === normalizedAcceptedMimeType;
  });
}

function createAbortResult(): ScannerDecodeResult {
  return createScannerRecoverableFailure(
    'SESSION_ABORTED',
    'Photo decode was aborted before completion'
  );
}

function waitForAbort(signal?: AbortSignal): Promise<never> {
  return new Promise((_resolve, reject) => {
    signal?.addEventListener(
      'abort',
      () => {
        reject(new DOMException('Photo decode aborted', 'AbortError'));
      },
      { once: true }
    );
  });
}

async function loadImageFromFile(
  file: File,
  signal?: AbortSignal
): Promise<HTMLImageElement> {
  const objectUrl = URL.createObjectURL(file);
  const image = new Image();

  try {
    const loadPromise = new Promise<HTMLImageElement>((resolve, reject) => {
      image.onload = () => resolve(image);
      image.onerror = () => {
        reject(new Error('Selected image file could not be loaded for decode'));
      };
    });

    image.src = objectUrl;

    if (signal === undefined) {
      return await loadPromise;
    }

    return await Promise.race([loadPromise, waitForAbort(signal)]);
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

class DefaultPhotoScannerAdapter implements PhotoScannerAdapter {
  private readonly options: PhotoScannerAdapterOptions;

  public constructor(options: PhotoScannerAdapterOptions) {
    this.options = options;
  }

  public async getCapability(): Promise<ScannerPhotoCapabilityReport> {
    const acceptedMimeTypes = resolveAcceptedMimeTypes(
      this.options.acceptedMimeTypes
    );

    return {
      mode: 'photo',
      supported: supportsPhotoScanning(),
      secureContext:
        typeof window !== 'undefined' ? window.isSecureContext === true : false,
      permissionState: supportsPhotoScanning() ? 'unknown' : 'unavailable',
      hasFileApi: typeof File !== 'undefined',
      hasObjectUrlApi:
        typeof URL !== 'undefined' &&
        typeof URL.createObjectURL === 'function' &&
        typeof URL.revokeObjectURL === 'function',
      acceptedMimeTypes,
      maxFileSizeBytes:
        this.options.maxFileSizeBytes ?? DEFAULT_MAX_FILE_SIZE_BYTES,
    };
  }

  public async decodeFile(
    input: DecodeScannerPhotoInput
  ): Promise<ScannerDecodeResult> {
    if (!supportsPhotoScanning()) {
      return createScannerFatalFailure(
        'BROWSER_UNSUPPORTED',
        'Photo decode requires browser image and object URL APIs'
      );
    }

    if (input.signal?.aborted === true) {
      return createAbortResult();
    }

    const acceptedMimeTypes = resolveAcceptedMimeTypes(
      this.options.acceptedMimeTypes
    );
    const maxFileSizeBytes =
      this.options.maxFileSizeBytes ?? DEFAULT_MAX_FILE_SIZE_BYTES;

    if (input.file.size > maxFileSizeBytes) {
      return createScannerFileTooLargeFailure({
        fileName: input.file.name,
        actualSizeBytes: input.file.size,
        maxSizeBytes: maxFileSizeBytes,
      });
    }

    if (!isAcceptedMimeType(input.file, acceptedMimeTypes)) {
      return createScannerRecoverableFailure(
        'FILE_UNSUPPORTED',
        'Selected file type is not supported for photo decode',
        input.file.type
      );
    }

    let image: HTMLImageElement | null = null;

    try {
      image = await loadImageFromFile(input.file, input.signal);
      const codeReader = new BrowserMultiFormatReader(
        createZxingDecodeHints({
          ...input.decodeHints,
          tryHarder: input.decodeHints?.tryHarder ?? true,
        }),
        this.options.readerOptions
      );
      const result = await codeReader.decodeFromImageElement(image);

      if (input.signal?.aborted) {
        return createAbortResult();
      }

      return createScannerResultFromZxingResult(result, 'scanner-photo');
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') {
        return createAbortResult();
      }

      if (
        error instanceof Error &&
        error.message === 'Selected image file could not be loaded for decode'
      ) {
        return createScannerRecoverableFailure(
          'FILE_READ_FAILED',
          'Selected image file could not be loaded for decode',
          input.file.name
        );
      }

      return mapZxingDecodeErrorToResult(error);
    } finally {
      if (image !== null) {
        BrowserCodeReader.destroyImageElement(image);
      }
    }
  }
}

export function createPhotoScannerAdapter(
  options: PhotoScannerAdapterOptions = {}
): PhotoScannerAdapter {
  return new DefaultPhotoScannerAdapter(options);
}
