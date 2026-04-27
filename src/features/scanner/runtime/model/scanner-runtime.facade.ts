import { browserScannerRuntimeController } from '@/infrastructure/browser/scanner/runtime/controller.instance.ts';

import { getPreferredScannerTab } from './scanner-preferences.store.ts';
import type { OpenScannerSessionInput } from './scanner-session.types.ts';

export const scannerRuntimeController = browserScannerRuntimeController;

export type ScannerRuntimeControllerInstance = typeof scannerRuntimeController;
export type ScannerOpenSessionResult = ReturnType<
  ScannerRuntimeControllerInstance['openSession']
>;

export function openScannerSession(
  input: Omit<OpenScannerSessionInput, 'activeTab'> &
    Partial<Pick<OpenScannerSessionInput, 'activeTab'>>
): ScannerOpenSessionResult {
  return scannerRuntimeController.openSession({
    ...input,
    activeTab: input.activeTab ?? getPreferredScannerTab(),
  });
}
