import type { Area } from 'react-easy-crop';

export function getRadianAngle(rotation: number): number {
  return (rotation * Math.PI) / 180;
}

export function rotateSize(
  width: number,
  height: number,
  rotation: number
): {
  width: number;
  height: number;
} {
  const radians = getRadianAngle(rotation);

  return {
    width:
      Math.abs(Math.cos(radians) * width) +
      Math.abs(Math.sin(radians) * height),
    height:
      Math.abs(Math.sin(radians) * width) +
      Math.abs(Math.cos(radians) * height),
  };
}

export async function loadImageElement(
  imageUrl: string,
  errorMessage = 'Не удалось загрузить изображение.'
): Promise<HTMLImageElement> {
  return await new Promise((resolve, reject) => {
    const image = new Image();

    image.onload = () => {
      resolve(image);
    };
    image.onerror = () => {
      reject(new Error(errorMessage));
    };
    image.src = imageUrl;
  });
}

export async function createCroppedImageFile({
  crop,
  fileName,
  flipX,
  flipY,
  imageUrl,
  mimeType,
  rotation,
  loadImageErrorMessage = 'Не удалось загрузить изображение.',
  prepareFileErrorMessage = 'Не удалось подготовить кадрированный файл.',
}: Readonly<{
  crop: Area;
  fileName: string;
  flipX: boolean;
  flipY: boolean;
  imageUrl: string;
  mimeType: string;
  rotation: number;
  loadImageErrorMessage?: string;
  prepareFileErrorMessage?: string;
}>): Promise<File> {
  const image = await loadImageElement(imageUrl, loadImageErrorMessage);
  const safeArea = rotateSize(image.width, image.height, rotation);
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');

  if (context === null) {
    throw new Error('Canvas context unavailable for image crop.');
  }

  canvas.width = safeArea.width;
  canvas.height = safeArea.height;

  context.translate(safeArea.width / 2, safeArea.height / 2);
  context.rotate(getRadianAngle(rotation));
  context.scale(flipX ? -1 : 1, flipY ? -1 : 1);
  context.translate(-image.width / 2, -image.height / 2);
  context.drawImage(image, 0, 0);

  const croppedCanvas = document.createElement('canvas');
  const croppedContext = croppedCanvas.getContext('2d');

  if (croppedContext === null) {
    throw new Error('Cropped canvas context unavailable for image crop.');
  }

  croppedCanvas.width = crop.width;
  croppedCanvas.height = crop.height;
  croppedContext.drawImage(
    canvas,
    crop.x,
    crop.y,
    crop.width,
    crop.height,
    0,
    0,
    crop.width,
    crop.height
  );

  const blob = await new Promise<Blob>((resolve, reject) => {
    croppedCanvas.toBlob((result) => {
      if (result === null) {
        reject(new Error(prepareFileErrorMessage));
        return;
      }

      resolve(result);
    }, mimeType);
  });

  return new File([blob], fileName, {
    type: blob.type || mimeType,
    lastModified: Date.now(),
  });
}
