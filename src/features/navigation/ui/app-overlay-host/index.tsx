import type { ReactElement } from 'react';

import { BufferPickerModal } from '@/features/buffer-picker/buffer-picker-modal.tsx';
import { ScannerModal } from '@/features/scanner-runtime/ui/scanner-modal';

export function AppOverlayHost(): ReactElement {
  return (
    <>
      <BufferPickerModal />
      <ScannerModal />
    </>
  );
}
