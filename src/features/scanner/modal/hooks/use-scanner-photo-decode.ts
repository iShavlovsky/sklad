import { type RefObject, useCallback } from 'react';

import type { ScannerRuntimeControllerInstance } from '@/features/scanner/runtime/scanner-runtime.public.ts';
import { createCroppedImageFile as createCroppedScannerFile } from '@/shared/lib/media/image-transform.ts';

import { getScannerErrorMessage } from '../error-presentation.ts';
import type { PhotoEditorState } from '../photo-editor.state.ts';

interface UseScannerPhotoDecodeInput {
  activeTab: 'live' | 'photo';
  controller: ScannerRuntimeControllerInstance;
  pendingTab: 'live' | 'photo';
  photoAbortRef: RefObject<AbortController | null>;
  photoEditor: PhotoEditorState;
  photoMaxFileSizeBytes: number | null;
  resetPhotoEditor: () => void;
  selectedFile: File | null;
  setIsOperationPending: (pending: boolean) => void;
}

export function useScannerPhotoDecode({
  activeTab,
  controller,
  pendingTab,
  photoAbortRef,
  photoEditor,
  photoMaxFileSizeBytes,
  resetPhotoEditor,
  selectedFile,
  setIsOperationPending,
}: UseScannerPhotoDecodeInput): () => Promise<void> {
  return useCallback(async (): Promise<void> => {
    if (selectedFile === null || photoEditor.objectUrl === null) {
      return;
    }

    if (
      photoMaxFileSizeBytes !== null &&
      selectedFile.size > photoMaxFileSizeBytes
    ) {
      resetPhotoEditor();
      controller.reportFileSelection({
        status: 'rejected-too-large',
        message:
          getScannerErrorMessage('file-too-large') ??
          'Файл превышает допустимый размер для фото-сканирования.',
      });
      return;
    }

    if (pendingTab === 'photo' && activeTab !== 'photo') {
      controller.switchTab('photo');
    }

    const abortController = new AbortController();
    photoAbortRef.current?.abort();
    photoAbortRef.current = abortController;
    setIsOperationPending(true);

    try {
      const fileForDecode =
        photoEditor.croppedAreaPixels === null
          ? selectedFile
          : await createCroppedScannerFile({
              crop: photoEditor.croppedAreaPixels,
              fileName: selectedFile.name,
              flipX: photoEditor.flipX,
              flipY: photoEditor.flipY,
              imageUrl: photoEditor.objectUrl,
              mimeType:
                selectedFile.type.trim().length > 0
                  ? selectedFile.type
                  : 'image/png',
              rotation: photoEditor.rotation,
            });

      await controller.decodePhotoFile({
        file: fileForDecode,
        signal: abortController.signal,
      });
    } finally {
      setIsOperationPending(false);
    }
  }, [
    activeTab,
    controller,
    pendingTab,
    photoAbortRef,
    photoEditor,
    photoMaxFileSizeBytes,
    resetPhotoEditor,
    selectedFile,
    setIsOperationPending,
  ]);
}
