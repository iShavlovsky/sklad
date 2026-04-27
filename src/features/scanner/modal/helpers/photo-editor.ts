import type { MediaSize, Point } from 'react-easy-crop';
import { clamp } from '@mantine/hooks';

import {
  INITIAL_PHOTO_EDITOR_STATE,
  type PhotoEditorState,
} from '../photo-editor.state.ts';

const PHOTO_EDITOR_MIN_ZOOM = 1;
const PHOTO_EDITOR_MAX_ZOOM = 3;

export function resolvePhotoEditorOnMediaLoaded(
  current: PhotoEditorState,
  mediaSize: MediaSize
): PhotoEditorState {
  const nextZoom = clamp(
    current.zoom,
    PHOTO_EDITOR_MIN_ZOOM,
    PHOTO_EDITOR_MAX_ZOOM
  );

  if (
    current.zoom === nextZoom &&
    current.croppedAreaPercentages !== null &&
    mediaSize.width > 0 &&
    mediaSize.height > 0
  ) {
    return current;
  }

  return {
    ...current,
    zoom: nextZoom,
  };
}

export function resetPhotoEditorTransform(
  current: PhotoEditorState
): PhotoEditorState {
  if (
    arePointsEqual(current.crop, INITIAL_PHOTO_EDITOR_STATE.crop) &&
    current.zoom === INITIAL_PHOTO_EDITOR_STATE.zoom &&
    current.rotation === INITIAL_PHOTO_EDITOR_STATE.rotation &&
    current.flipX === INITIAL_PHOTO_EDITOR_STATE.flipX &&
    current.flipY === INITIAL_PHOTO_EDITOR_STATE.flipY &&
    areCropAreasEqual(
      current.croppedAreaPercentages,
      INITIAL_PHOTO_EDITOR_STATE.croppedAreaPercentages
    ) &&
    areCropAreasEqual(
      current.croppedAreaPixels,
      INITIAL_PHOTO_EDITOR_STATE.croppedAreaPixels
    ) &&
    current.isDragOver === INITIAL_PHOTO_EDITOR_STATE.isDragOver
  ) {
    return current;
  }

  return {
    ...current,
    crop: INITIAL_PHOTO_EDITOR_STATE.crop,
    zoom: INITIAL_PHOTO_EDITOR_STATE.zoom,
    rotation: INITIAL_PHOTO_EDITOR_STATE.rotation,
    flipX: INITIAL_PHOTO_EDITOR_STATE.flipX,
    flipY: INITIAL_PHOTO_EDITOR_STATE.flipY,
    croppedAreaPercentages: INITIAL_PHOTO_EDITOR_STATE.croppedAreaPercentages,
    croppedAreaPixels: INITIAL_PHOTO_EDITOR_STATE.croppedAreaPixels,
    isDragOver: INITIAL_PHOTO_EDITOR_STATE.isDragOver,
  };
}

export function arePointsEqual(left: Point, right: Point): boolean {
  return left.x === right.x && left.y === right.y;
}

export function areCropAreasEqual(
  left: PhotoEditorState['croppedAreaPercentages'],
  right: PhotoEditorState['croppedAreaPercentages']
): boolean {
  if (left === right) {
    return true;
  }

  if (left === null || right === null) {
    return false;
  }

  return (
    left.width === right.width &&
    left.height === right.height &&
    left.x === right.x &&
    left.y === right.y
  );
}
