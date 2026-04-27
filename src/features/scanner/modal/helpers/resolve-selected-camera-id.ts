export function resolveSelectedCameraId(
  liveCameraOptions: Array<{ value: string; label: string }>,
  selectedCameraId: string | null
): string | null {
  return selectedCameraId !== null &&
    liveCameraOptions.some((camera) => camera.value === selectedCameraId)
    ? selectedCameraId
    : (liveCameraOptions[0]?.value ?? null);
}
