import type { BrowserScannerRuntimeController } from '../../../../infrastructure/browser/scanner/runtime/controller.instance.ts';

export type ScannerCapabilityState = {
  live:
    | Awaited<
        ReturnType<BrowserScannerRuntimeController['loadLiveCapability']>
      >['capability']
    | null;
  photo:
    | Awaited<
        ReturnType<BrowserScannerRuntimeController['loadPhotoCapability']>
      >['capability']
    | null;
};
