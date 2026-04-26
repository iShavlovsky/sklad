import type { Dispatch, RefObject, SetStateAction } from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';

import type { BrowserScannerRuntimeController } from '@/infrastructure/browser/scanner/runtime/controller.instance.ts';

import {
  INITIAL_PHOTO_EDITOR_STATE,
  type PhotoEditorState,
} from '../photo-editor.state.ts';

export function useScannerPhotoEditor(
  controller: BrowserScannerRuntimeController
): {
  applyPhotoFile: (file: File | null) => void;
  photoAbortRef: RefObject<AbortController | null>;
  photoEditor: PhotoEditorState;
  resetPhotoEditor: () => void;
  setPhotoEditor: Dispatch<SetStateAction<PhotoEditorState>>;
} {
  const [photoEditor, setPhotoEditor] = useState<PhotoEditorState>(
    INITIAL_PHOTO_EDITOR_STATE
  );
  const photoAbortRef = useRef<AbortController | null>(null);

  const resetPhotoEditor = useCallback((): void => {
    setPhotoEditor((current) => {
      if (current.objectUrl !== null) {
        URL.revokeObjectURL(current.objectUrl);
      }

      return INITIAL_PHOTO_EDITOR_STATE;
    });
  }, []);

  const applyPhotoFile = useCallback(
    (file: File | null): void => {
      photoAbortRef.current?.abort();
      photoAbortRef.current = null;

      if (file === null) {
        resetPhotoEditor();
        controller.reportFileSelection({
          status: 'cleared',
          message: 'Файл очищен.',
        });
        return;
      }

      const objectUrl = URL.createObjectURL(file);

      setPhotoEditor((current) => {
        if (current.objectUrl !== null) {
          URL.revokeObjectURL(current.objectUrl);
        }

        return {
          ...INITIAL_PHOTO_EDITOR_STATE,
          objectUrl,
        };
      });

      controller.reportFileSelection({
        status: 'selected',
        file,
        message: 'Файл готов к обработке.',
      });
    },
    [controller, resetPhotoEditor]
  );

  useEffect(() => {
    return () => {
      if (photoEditor.objectUrl !== null) {
        URL.revokeObjectURL(photoEditor.objectUrl);
      }
    };
  }, [photoEditor.objectUrl]);

  return {
    applyPhotoFile,
    photoAbortRef,
    photoEditor,
    resetPhotoEditor,
    setPhotoEditor,
  };
}
