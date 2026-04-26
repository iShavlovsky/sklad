import {
  BrowserMultiFormatReader,
  type IBrowserCodeReaderOptions,
  type IScannerControls,
} from '@zxing/browser';

import { createId } from '../../../../shared/utils/create-id.ts';
import type {
  ScannerBrowserPermissionState,
  ScannerLiveCameraOption,
  ScannerLiveCapabilityReport,
} from '../contracts/capability-report.ts';
import type {
  ScannerDecodeHints,
  ScannerSessionStopReason,
} from '../contracts/contracts.ts';
import type {
  ScannerFatalFailure,
  ScannerRecoverableFailure,
} from '../contracts/decode-result.ts';
import type { ScannerDecodeResult } from '../contracts/decode-result.ts';
import {
  createScannerFatalFailure,
  createScannerRecoverableFailure,
} from '../contracts/decode-result.ts';
import { createZxingDecodeHints } from '../zxing/decode-hints.ts';
import {
  createScannerResultFromZxingResult,
  mapZxingDecodeErrorToResult,
} from '../zxing/error-mapping.ts';

export interface StartLiveScannerSessionInput {
  readonly previewElement: HTMLVideoElement;
  readonly deviceId?: string | null;
  readonly constraints?: MediaTrackConstraints | null;
  readonly decodeHints?: ScannerDecodeHints | null;
  readonly onDecode: (result: ScannerDecodeResult) => void | Promise<void>;
}

export interface LiveScannerSessionHandle {
  readonly kind: 'live';
  readonly sessionId: string;
  stop(
    reason?: ScannerSessionStopReason
  ): Promise<StopLiveScannerSessionResult>;
}

export interface LiveScannerSessionStarted {
  readonly ok: true;
  readonly code: 'STARTED';
  readonly session: LiveScannerSessionHandle;
}

export type StartLiveScannerSessionResult =
  | LiveScannerSessionStarted
  | ScannerRecoverableFailure<
      | 'CAMERA_PERMISSION_DENIED'
      | 'CAMERA_NOT_FOUND'
      | 'CAMERA_IN_USE'
      | 'SESSION_ABORTED'
      | 'SESSION_ALREADY_ACTIVE'
    >
  | ScannerFatalFailure<
      | 'BROWSER_UNSUPPORTED'
      | 'SECURE_CONTEXT_REQUIRED'
      | 'CAMERA_UNAVAILABLE'
      | 'SESSION_START_FAILED'
      | 'UNKNOWN_FAILURE'
    >;

export interface LiveScannerSessionStopped {
  readonly ok: true;
  readonly code: 'STOPPED';
  readonly sessionId: string;
  readonly reason: ScannerSessionStopReason;
}

export type StopLiveScannerSessionResult =
  | LiveScannerSessionStopped
  | ScannerRecoverableFailure<'SESSION_NOT_ACTIVE'>
  | ScannerFatalFailure<'SESSION_STOP_FAILED' | 'UNKNOWN_FAILURE'>;

export interface LiveScannerAdapter {
  getCapability(): Promise<ScannerLiveCapabilityReport>;
  startSession(
    input: StartLiveScannerSessionInput
  ): Promise<StartLiveScannerSessionResult>;
}

export interface LiveScannerAdapterOptions {
  readonly readerOptions?: IBrowserCodeReaderOptions;
  readonly defaultConstraints?: MediaTrackConstraints;
}

interface ActiveLiveScannerSession {
  readonly sessionId: string;
  readonly controls: IScannerControls;
}

const DEFAULT_LIVE_CONSTRAINTS = {
  facingMode: {
    ideal: 'environment',
  },
} as const satisfies MediaTrackConstraints;

function createSessionId(): string {
  return `scanner-live-${createId()}`;
}

function isBrowserAvailable(): boolean {
  return typeof window !== 'undefined' && typeof navigator !== 'undefined';
}

function isSecureContextAvailable(): boolean {
  return typeof window !== 'undefined' && window.isSecureContext === true;
}

function supportsLiveScanning(): boolean {
  return (
    isBrowserAvailable() &&
    navigator.mediaDevices !== undefined &&
    typeof navigator.mediaDevices.getUserMedia === 'function'
  );
}

async function resolveCameraPermissionState(): Promise<ScannerBrowserPermissionState> {
  if (
    !isBrowserAvailable() ||
    navigator.permissions === undefined ||
    typeof navigator.permissions.query !== 'function'
  ) {
    return supportsLiveScanning() ? 'unknown' : 'unavailable';
  }

  try {
    const permissionStatus = await navigator.permissions.query({
      name: 'camera' as PermissionName,
    });

    switch (permissionStatus.state) {
      case 'granted':
        return 'granted';
      case 'denied':
        return 'denied';
      case 'prompt':
        return 'prompt';
      default:
        return 'unknown';
    }
  } catch {
    return supportsLiveScanning() ? 'unknown' : 'unavailable';
  }
}

async function resolveAvailableCameraCount(): Promise<number | null> {
  if (
    !isBrowserAvailable() ||
    navigator.mediaDevices === undefined ||
    typeof navigator.mediaDevices.enumerateDevices !== 'function'
  ) {
    return null;
  }

  try {
    const devices = await navigator.mediaDevices.enumerateDevices();

    return devices.filter((device) => device.kind === 'videoinput').length;
  } catch {
    return null;
  }
}

async function resolveAvailableCameras(): Promise<ScannerLiveCameraOption[]> {
  if (
    !isBrowserAvailable() ||
    navigator.mediaDevices === undefined ||
    typeof navigator.mediaDevices.enumerateDevices !== 'function'
  ) {
    return [];
  }

  try {
    const devices = await navigator.mediaDevices.enumerateDevices();

    return devices
      .filter((device) => device.kind === 'videoinput')
      .map((device, index) => ({
        deviceId: device.deviceId,
        label:
          device.label.trim().length > 0 ? device.label : `Камера ${index + 1}`,
      }));
  } catch {
    return [];
  }
}

function resolveLiveConstraints(
  input: StartLiveScannerSessionInput,
  options: LiveScannerAdapterOptions
): MediaTrackConstraints {
  if (input.constraints !== null && input.constraints !== undefined) {
    return input.constraints;
  }

  if (input.deviceId !== null && input.deviceId !== undefined) {
    return {
      deviceId: {
        exact: input.deviceId,
      },
      ...(options.defaultConstraints ?? DEFAULT_LIVE_CONSTRAINTS),
    };
  }

  return options.defaultConstraints ?? DEFAULT_LIVE_CONSTRAINTS;
}

function mapStartFailure(
  error: unknown
): Exclude<StartLiveScannerSessionResult, LiveScannerSessionStarted> {
  const mapped = mapZxingDecodeErrorToResult(error);

  if (mapped.kind === 'no-result') {
    return createScannerFatalFailure(
      'SESSION_START_FAILED',
      'Scanner live session could not be started',
      mapped.details
    );
  }

  if (mapped.kind === 'recoverable-failure') {
    switch (mapped.code) {
      case 'CAMERA_PERMISSION_DENIED':
      case 'CAMERA_NOT_FOUND':
      case 'CAMERA_IN_USE':
      case 'SESSION_ABORTED':
        return createScannerRecoverableFailure(
          mapped.code,
          mapped.message,
          mapped.details
        );
      default:
        return createScannerFatalFailure(
          'SESSION_START_FAILED',
          'Scanner live session could not be started',
          mapped.details
        );
    }
  }

  if (mapped.code === 'SECURE_CONTEXT_REQUIRED') {
    return mapped;
  }

  return createScannerFatalFailure(
    mapped.code === 'UNKNOWN_FAILURE' ? 'SESSION_START_FAILED' : mapped.code,
    'Scanner live session could not be started',
    mapped.details
  );
}

class DefaultLiveScannerAdapter implements LiveScannerAdapter {
  private activeSession: ActiveLiveScannerSession | null = null;

  private readonly options: LiveScannerAdapterOptions;

  public constructor(options: LiveScannerAdapterOptions) {
    this.options = options;
  }

  public async getCapability(): Promise<ScannerLiveCapabilityReport> {
    const secureContext = isSecureContextAvailable();
    const hasMediaDevicesApi =
      isBrowserAvailable() && navigator.mediaDevices !== undefined;
    const hasGetUserMedia =
      hasMediaDevicesApi &&
      typeof navigator.mediaDevices.getUserMedia === 'function';
    const hasEnumerateDevices =
      hasMediaDevicesApi &&
      typeof navigator.mediaDevices.enumerateDevices === 'function';

    const availableCameras = await resolveAvailableCameras();

    return {
      mode: 'live',
      supported: secureContext && hasGetUserMedia,
      secureContext,
      permissionState: await resolveCameraPermissionState(),
      hasMediaDevicesApi,
      hasGetUserMedia,
      hasEnumerateDevices,
      availableCameras,
      availableCameraCount:
        availableCameras.length > 0
          ? availableCameras.length
          : await resolveAvailableCameraCount(),
    };
  }

  public async startSession(
    input: StartLiveScannerSessionInput
  ): Promise<StartLiveScannerSessionResult> {
    if (!isBrowserAvailable()) {
      return createScannerFatalFailure(
        'BROWSER_UNSUPPORTED',
        'Scanner live sessions require a browser environment'
      );
    }

    if (!isSecureContextAvailable()) {
      return createScannerFatalFailure(
        'SECURE_CONTEXT_REQUIRED',
        'Scanner live sessions require a secure browser context'
      );
    }

    if (!supportsLiveScanning()) {
      return createScannerFatalFailure(
        'CAMERA_UNAVAILABLE',
        'Camera APIs are unavailable in this browser'
      );
    }

    if (this.activeSession !== null) {
      return createScannerRecoverableFailure(
        'SESSION_ALREADY_ACTIVE',
        'A live scanner session is already active'
      );
    }

    try {
      const codeReader = new BrowserMultiFormatReader(
        createZxingDecodeHints({
          ...input.decodeHints,
          tryHarder: input.decodeHints?.tryHarder ?? true,
        }),
        this.options.readerOptions
      );
      const controls = await codeReader.decodeFromConstraints(
        {
          audio: false,
          video: resolveLiveConstraints(input, this.options),
        },
        input.previewElement,
        (result, error) => {
          if (result !== undefined) {
            void Promise.resolve(
              input.onDecode(
                createScannerResultFromZxingResult(result, 'scanner-live')
              )
            );

            return;
          }

          if (error === undefined) {
            return;
          }

          const mapped = mapZxingDecodeErrorToResult(error);
          if (mapped.code === 'NO_RESULT') {
            return;
          }

          void Promise.resolve(input.onDecode(mapped));
        }
      );

      const sessionId = createSessionId();
      this.activeSession = {
        sessionId,
        controls,
      };

      return {
        ok: true,
        code: 'STARTED',
        session: {
          kind: 'live',
          sessionId,
          stop: (reason: ScannerSessionStopReason = 'caller') =>
            this.stopSession(sessionId, reason),
        },
      };
    } catch (error) {
      return mapStartFailure(error);
    }
  }

  private async stopSession(
    sessionId: string,
    reason: ScannerSessionStopReason
  ): Promise<StopLiveScannerSessionResult> {
    if (
      this.activeSession === null ||
      this.activeSession.sessionId !== sessionId
    ) {
      return createScannerRecoverableFailure(
        'SESSION_NOT_ACTIVE',
        'No matching live scanner session is active'
      );
    }

    try {
      this.activeSession.controls.stop();
      this.activeSession = null;

      return {
        ok: true,
        code: 'STOPPED',
        sessionId,
        reason,
      };
    } catch (error) {
      this.activeSession = null;

      return createScannerFatalFailure(
        'SESSION_STOP_FAILED',
        'Live scanner session could not be stopped cleanly',
        error instanceof Error ? error.message : String(error)
      );
    }
  }
}

export function createLiveScannerAdapter(
  options: LiveScannerAdapterOptions = {}
): LiveScannerAdapter {
  return new DefaultLiveScannerAdapter(options);
}
