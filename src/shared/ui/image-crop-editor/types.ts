import type { Area, Point } from 'react-easy-crop';

export type ImageCropEditorState = {
  crop: Point;
  zoom: number;
  rotation: number;
  flipX: boolean;
  flipY: boolean;
  croppedAreaPercentages: Area | null;
  croppedAreaPixels: Area | null;
};

export const INITIAL_IMAGE_CROP_EDITOR_STATE: ImageCropEditorState = {
  crop: { x: 0, y: 0 },
  zoom: 1,
  rotation: 0,
  flipX: false,
  flipY: false,
  croppedAreaPercentages: null,
  croppedAreaPixels: null,
};
