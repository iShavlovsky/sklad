import type { ScannerAdapterMode } from './contracts.ts';

export interface ScannerLiveCameraOption {
  readonly deviceId: string;
  readonly label: string;
}

export type ScannerBrowserPermissionState =
  | 'unknown'
  | 'prompt'
  | 'granted'
  | 'denied'
  | 'unavailable';

interface ScannerCapabilityBase {
  readonly mode: ScannerAdapterMode;
  readonly supported: boolean;
  readonly secureContext: boolean;
}

/** Live camera capability stays distinct from photo/file capability on purpose. */
export interface ScannerLiveCapabilityReport extends ScannerCapabilityBase {
  readonly mode: 'live';
  readonly permissionState: ScannerBrowserPermissionState;
  readonly hasMediaDevicesApi: boolean;
  readonly hasGetUserMedia: boolean;
  readonly hasEnumerateDevices: boolean;
  readonly availableCameras: readonly ScannerLiveCameraOption[];
  readonly availableCameraCount: number | null;
}

export interface ScannerPhotoCapabilityReport extends ScannerCapabilityBase {
  readonly mode: 'photo';
  readonly permissionState: 'unknown' | 'unavailable';
  readonly hasFileApi: boolean;
  readonly hasObjectUrlApi: boolean;
  readonly acceptedMimeTypes: readonly string[];
  readonly maxFileSizeBytes: number | null;
}

export type ScannerCapabilityReport =
  | ScannerLiveCapabilityReport
  | ScannerPhotoCapabilityReport;
