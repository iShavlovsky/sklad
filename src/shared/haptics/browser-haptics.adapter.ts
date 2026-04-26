import type {
  HapticPattern,
  HapticsPort,
  HapticTriggerResult,
} from './haptics.types';

function resolveBrowserPattern(pattern: HapticPattern): number | number[] {
  switch (pattern) {
    case 'tap':
      return 10;
    case 'selection':
      return 14;
    case 'success':
      return [18, 30, 18];
    case 'warning':
      return [24, 40, 24];
    case 'error':
      return [36, 48, 36];
    case 'confirm':
      return [16, 24, 16];
  }
}

export class BrowserHapticsAdapter implements HapticsPort {
  public async trigger(pattern: HapticPattern): Promise<HapticTriggerResult> {
    if (typeof navigator === 'undefined' || !('vibrate' in navigator)) {
      return { code: 'unsupported' };
    }

    const didTrigger = navigator.vibrate(resolveBrowserPattern(pattern));
    return didTrigger ? { code: 'triggered' } : { code: 'suppressed' };
  }
}
