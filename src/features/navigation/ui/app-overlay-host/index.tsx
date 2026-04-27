import type { ReactElement } from 'react';

import { BufferPickerModal } from '@/features/buffer/picker/ui/buffer-picker-modal';
import { ScannerModal } from '@/features/scanner/modal';

export function AppOverlayHost(): ReactElement {
  return (
    <>
      <BufferPickerModal />
      <ScannerModal />
    </>
  );
}
