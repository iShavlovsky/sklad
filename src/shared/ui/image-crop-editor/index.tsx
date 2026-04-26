import type { ReactElement } from 'react';
import type { Area, MediaSize, Point } from 'react-easy-crop';
import Cropper from 'react-easy-crop';
import { ActionIcon, Group, Paper } from '@mantine/core';
import { clamp } from '@mantine/hooks';
import {
  IconFlipHorizontal,
  IconFlipVertical,
  IconRefresh,
  IconRotateClockwise2,
  IconZoomIn,
} from '@tabler/icons-react';

import { HorizontalSlider } from '@/shared/ui/horizontal-slider';

import styles from './styles.module.css';

const DEFAULT_ASPECT_RATIO = 1;
const DEFAULT_MIN_ZOOM = 1;
const DEFAULT_MAX_ZOOM = 3;
const DEFAULT_ROTATION_RANGE = 180;

type ImageCropEditorProps = {
  crop: Point;
  croppedAreaPercentages: Area | null;
  flipHorizontalLabel: string;
  flipVerticalLabel: string;
  flipX: boolean;
  flipY: boolean;
  imageUrl: string;
  resetLabel: string;
  rotation: number;
  rotationLabel: string;
  zoom: number;
  zoomLabel: string;
  onCropChange: (crop: Point) => void;
  onCropComplete: (
    croppedAreaPercentages: Area,
    croppedAreaPixels: Area
  ) => void;
  onFlipXToggle: () => void;
  onFlipYToggle: () => void;
  onMediaLoaded?: (mediaSize: MediaSize) => void;
  onReset: () => void;
  onRotationChange: (rotation: number) => void;
  onZoomChange: (zoom: number) => void;
};

export function ImageCropEditor({
  crop,
  croppedAreaPercentages,
  flipHorizontalLabel,
  flipVerticalLabel,
  flipX,
  flipY,
  imageUrl,
  resetLabel,
  rotation,
  rotationLabel,
  zoom,
  zoomLabel,
  onCropChange,
  onCropComplete,
  onFlipXToggle,
  onFlipYToggle,
  onMediaLoaded,
  onReset,
  onRotationChange,
  onZoomChange,
}: Readonly<ImageCropEditorProps>): ReactElement {
  const zoomValue = toNormalizedZoomValue(zoom);
  const rotationValue = toNormalizedRotationValue(rotation);

  return (
    <div className={`${styles.editor} scanner-photo-editor`}>
      <Paper
        bg="#0f172a"
        className={`${styles.cropper} scanner-photo-editor__cropper`}
        component="div"
        radius="md"
        withBorder
      >
        <Cropper
          key={imageUrl}
          aspect={DEFAULT_ASPECT_RATIO}
          crop={crop}
          disableAutomaticStylesInjection
          image={imageUrl}
          initialCroppedAreaPercentages={croppedAreaPercentages ?? undefined}
          maxZoom={DEFAULT_MAX_ZOOM}
          minZoom={DEFAULT_MIN_ZOOM}
          objectFit="contain"
          restrictPosition
          rotation={rotation}
          showGrid
          transform={buildImageCropTransform({
            crop,
            flipX,
            flipY,
            rotation,
            zoom,
          })}
          zoom={zoom}
          onCropChange={onCropChange}
          onCropComplete={onCropComplete}
          onMediaLoaded={onMediaLoaded}
          onRotationChange={onRotationChange}
          onZoomChange={(nextZoom) => {
            onZoomChange(clamp(nextZoom, DEFAULT_MIN_ZOOM, DEFAULT_MAX_ZOOM));
          }}
        />
      </Paper>

      <Paper
        bg="color-mix(in srgb, var(--sl-surface-card) 82%, var(--sl-surface-muted))"
        className={`${styles.controls} scanner-photo-editor__controls`}
        component="div"
        p={8}
        radius="md"
        withBorder
      >
        <Group
          className={`${styles.flipRow} scanner-photo-editor__flip-row`}
          gap={8}
          justify="center"
          wrap="nowrap"
        >
          <ActionIcon
            aria-label={flipHorizontalLabel}
            className="scanner-photo-editor__control-button"
            color="gray"
            onClick={onFlipXToggle}
            size="lg"
            variant="light"
          >
            <IconFlipHorizontal size={18} stroke={1.8} />
          </ActionIcon>
          <ActionIcon
            aria-label={resetLabel}
            className="scanner-photo-editor__control-button"
            color="gray"
            onClick={onReset}
            size="lg"
            variant="light"
          >
            <IconRefresh size={18} stroke={1.8} />
          </ActionIcon>
          <ActionIcon
            aria-label={flipVerticalLabel}
            className="scanner-photo-editor__control-button"
            color="gray"
            onClick={onFlipYToggle}
            size="lg"
            variant="light"
          >
            <IconFlipVertical size={18} stroke={1.8} />
          </ActionIcon>
        </Group>
        <div className={styles.slidersBlock}>
          <Group className={styles.sliderRow} gap={8} wrap="nowrap">
            <div className={styles.slider}>
              <HorizontalSlider
                icon={<IconZoomIn size={15} stroke={1.8} />}
                label={zoomLabel}
                title={zoomLabel}
                value={zoomValue}
                onChange={(value) => {
                  onZoomChange(toCropperZoomValue(value));
                }}
              />
            </div>
            <ActionIcon
              aria-label={`${zoomLabel}: сбросить`}
              className="scanner-photo-editor__control-button"
              color="gray"
              onClick={() => {
                onZoomChange(DEFAULT_MIN_ZOOM);
              }}
              size="lg"
              variant="light"
            >
              <IconRefresh size={18} stroke={1.8} />
            </ActionIcon>
          </Group>

          <Group className={styles.sliderRow} gap={8} wrap="nowrap">
            <div className={styles.slider}>
              <HorizontalSlider
                icon={<IconRotateClockwise2 size={15} stroke={1.8} />}
                label={rotationLabel}
                title={rotationLabel}
                value={rotationValue}
                onChange={(value) => {
                  onRotationChange(toCropperRotationValue(value));
                }}
              />
            </div>
            <ActionIcon
              aria-label={`${rotationLabel}: сбросить`}
              className="scanner-photo-editor__control-button"
              color="gray"
              onClick={() => {
                onRotationChange(0);
              }}
              size="lg"
              variant="light"
            >
              <IconRefresh size={18} stroke={1.8} />
            </ActionIcon>
          </Group>
        </div>
      </Paper>
    </div>
  );
}

function toNormalizedZoomValue(zoom: number): number {
  return clamp(
    (zoom - DEFAULT_MIN_ZOOM) / (DEFAULT_MAX_ZOOM - DEFAULT_MIN_ZOOM),
    0,
    1
  );
}

function toCropperZoomValue(value: number): number {
  return DEFAULT_MIN_ZOOM + value * (DEFAULT_MAX_ZOOM - DEFAULT_MIN_ZOOM);
}

function toNormalizedRotationValue(rotation: number): number {
  return clamp(
    (rotation + DEFAULT_ROTATION_RANGE) / (DEFAULT_ROTATION_RANGE * 2),
    0,
    1
  );
}

function toCropperRotationValue(value: number): number {
  return -DEFAULT_ROTATION_RANGE + value * DEFAULT_ROTATION_RANGE * 2;
}

function buildImageCropTransform(input: {
  crop: Point;
  flipX: boolean;
  flipY: boolean;
  rotation: number;
  zoom: number;
}): string {
  return `translate(${input.crop.x}px, ${input.crop.y}px) rotate(${input.rotation}deg) scale(${input.zoom}) scaleX(${input.flipX ? -1 : 1}) scaleY(${input.flipY ? -1 : 1})`;
}
