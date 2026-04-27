import type { Dispatch, ReactElement, SetStateAction } from 'react';
import { FileInput, Group, Text } from '@mantine/core';

import { FileDropzone } from '@/shared/ui/file-dropzone';
import { ImageCropEditor } from '@/shared/ui/image-crop-editor';

import { formatScannerFileSizeLabel } from '../file-size-label.ts';
import {
  areCropAreasEqual,
  arePointsEqual,
  resetPhotoEditorTransform,
  resolvePhotoEditorOnMediaLoaded,
} from '../helpers/photo-editor.ts';
import type { PhotoEditorState } from '../photo-editor.state.ts';

import styles from '../styles.module.css';

type ScannerPhotoPanelProps = {
  acceptedMimeTypes: readonly string[] | null;
  maxFileSizeBytes: number | null;
  photoEditor: PhotoEditorState;
  selectedFile: File | null;
  onDropFile: (file: File | null) => void;
  onFileChange: (file: File | null) => void;
  onPhotoEditorChange: Dispatch<SetStateAction<PhotoEditorState>>;
};

export function ScannerPhotoPanel({
  acceptedMimeTypes,
  maxFileSizeBytes,
  photoEditor,
  selectedFile,
  onDropFile,
  onFileChange,
  onPhotoEditorChange,
}: Readonly<ScannerPhotoPanelProps>): ReactElement {
  const fileMetaLabel = `До ${formatScannerFileSizeLabel(maxFileSizeBytes)}`;
  const photoObjectUrl = photoEditor.objectUrl;
  const hasSelectedPhoto = photoObjectUrl !== null;

  return (
    <div
      className={`${styles.photoPanel} scanner-modal__photo-panel`}
      data-has-photo={hasSelectedPhoto || undefined}
    >
      {hasSelectedPhoto && photoObjectUrl !== null ? (
        <ImageCropEditor
          crop={photoEditor.crop}
          croppedAreaPercentages={photoEditor.croppedAreaPercentages}
          flipHorizontalLabel="Отразить по горизонтали"
          flipVerticalLabel="Отразить по вертикали"
          flipX={photoEditor.flipX}
          flipY={photoEditor.flipY}
          imageUrl={photoObjectUrl}
          resetLabel="Сбросить кадрирование"
          rotation={photoEditor.rotation}
          rotationLabel="Поворот"
          zoom={photoEditor.zoom}
          zoomLabel="Зум"
          onCropChange={(crop) => {
            onPhotoEditorChange((current) =>
              arePointsEqual(current.crop, crop)
                ? current
                : { ...current, crop }
            );
          }}
          onCropComplete={(croppedAreaPercentages, croppedAreaPixels) => {
            onPhotoEditorChange((current) =>
              areCropAreasEqual(
                current.croppedAreaPercentages,
                croppedAreaPercentages
              ) &&
              areCropAreasEqual(current.croppedAreaPixels, croppedAreaPixels)
                ? current
                : {
                    ...current,
                    croppedAreaPercentages,
                    croppedAreaPixels,
                  }
            );
          }}
          onFlipXToggle={() => {
            onPhotoEditorChange((current) => ({
              ...current,
              flipX: !current.flipX,
            }));
          }}
          onFlipYToggle={() => {
            onPhotoEditorChange((current) => ({
              ...current,
              flipY: !current.flipY,
            }));
          }}
          onMediaLoaded={(mediaSize) => {
            onPhotoEditorChange((current) =>
              resolvePhotoEditorOnMediaLoaded(current, mediaSize)
            );
          }}
          onReset={() => {
            onPhotoEditorChange(resetPhotoEditorTransform);
          }}
          onRotationChange={(rotation) => {
            onPhotoEditorChange((current) =>
              current.rotation === rotation ? current : { ...current, rotation }
            );
          }}
          onZoomChange={(zoom) => {
            onPhotoEditorChange((current) =>
              current.zoom === zoom ? current : { ...current, zoom }
            );
          }}
        />
      ) : (
        <>
          <Group
            className={`${styles.fileMeta} scanner-photo-panel__file-meta`}
            justify="space-between"
            wrap="nowrap"
          >
            <Text fw={600} size="sm">
              Фото или файл
            </Text>
            <Text c="dimmed" size="xs">
              {fileMetaLabel}
            </Text>
          </Group>

          <FileInput
            accept={acceptedMimeTypes?.join(',') ?? 'image/*'}
            aria-label="Фото или файл"
            clearable
            id="scanner-photo-file-input"
            onChange={onFileChange}
            placeholder="Выберите файл для распознавания"
            value={selectedFile}
          />

          <FileDropzone
            accept={acceptedMimeTypes ? [...acceptedMimeTypes] : undefined}
            active={photoEditor.isDragOver}
            description="Или выберите изображение через поле выше."
            maxSize={maxFileSizeBytes ?? undefined}
            title="Перетащите файл сюда"
            onDragStateChange={(active) => {
              onPhotoEditorChange((current) =>
                current.isDragOver === active
                  ? current
                  : { ...current, isDragOver: active }
              );
            }}
            onDrop={(files) => {
              onDropFile(files[0] ?? null);
            }}
          />
        </>
      )}
    </div>
  );
}
