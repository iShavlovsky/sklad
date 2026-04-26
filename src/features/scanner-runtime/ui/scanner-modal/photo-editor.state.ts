import {
  type ImageCropEditorState,
  INITIAL_IMAGE_CROP_EDITOR_STATE,
} from '@/shared/ui/image-crop-editor/types.ts';

export type PhotoEditorState = ImageCropEditorState & {
  objectUrl: string | null;
  isDragOver: boolean;
};

export const INITIAL_PHOTO_EDITOR_STATE: PhotoEditorState = {
  ...INITIAL_IMAGE_CROP_EDITOR_STATE,
  objectUrl: null,
  isDragOver: false,
};
