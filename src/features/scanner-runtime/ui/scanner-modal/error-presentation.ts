import type {
  ScannerSessionErrorCode,
  ScannerSessionTab,
} from '../../model/scanner-session.types.ts';

export function getScannerErrorMessage(
  errorCode: ScannerSessionErrorCode | null
): string | null {
  switch (errorCode) {
    case 'permission-denied':
      return 'Нет доступа к камере. Проверьте разрешения в браузере или настройках устройства.';
    case 'camera-unavailable':
      return 'Камера недоступна в текущем режиме или на этом устройстве.';
    case 'decode-failed':
      return 'Код не удалось распознать. Повторите попытку или выберите другое изображение.';
    case 'file-too-large':
      return 'Файл превышает допустимый размер для фото-сканирования.';
    case 'session-error':
      return 'Непредвиденная ошибка. Попробуйте ещё раз.';
    default:
      return null;
  }
}

export function shouldDisplayScannerError(
  activeTab: ScannerSessionTab,
  errorCode: ScannerSessionErrorCode | null
): boolean {
  if (errorCode === null) return false;
  if (errorCode === 'session-error') return false;
  if (activeTab === 'live') return errorCode !== 'file-too-large';

  return errorCode === 'file-too-large';
}
