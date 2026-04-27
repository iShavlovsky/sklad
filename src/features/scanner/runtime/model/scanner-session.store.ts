import { createScannerSessionStore } from './create-scanner-session-store.ts';
import type { ScannerSessionStore } from './scanner-session.types.ts';

export const scannerSessionStore: ScannerSessionStore =
  createScannerSessionStore();
