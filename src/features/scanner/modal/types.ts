import type { ScannerRuntimeControllerInstance } from '@/features/scanner/runtime/scanner-runtime.public.ts';

export type ScannerCapabilityState = {
  live:
    | Awaited<
        ReturnType<ScannerRuntimeControllerInstance['loadLiveCapability']>
      >['capability']
    | null;
  photo:
    | Awaited<
        ReturnType<ScannerRuntimeControllerInstance['loadPhotoCapability']>
      >['capability']
    | null;
};
