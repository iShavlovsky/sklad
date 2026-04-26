export type ScannerAdapterMode = 'live' | 'photo';

export type ScannerDecodedSource = 'scanner-live' | 'scanner-photo';

export type ScannerSessionStopReason =
  | 'caller'
  | 'tab-switch'
  | 'session-close'
  | 'visibility-hidden'
  | 'route-change';

export interface ScannerDecodeHints {
  readonly formats?: readonly string[];
  readonly tryHarder?: boolean;
}

/** Canonical decoded payload crossing from browser scanner adapters into feature runtime. */
export interface ScannerDecodedPayload {
  readonly value: string;
  readonly capturedAt: string;
  readonly format: string | null;
  readonly source: ScannerDecodedSource;
}
