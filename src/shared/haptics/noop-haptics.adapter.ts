import type { HapticsPort, HapticTriggerResult } from './haptics.types';

export class NoopHapticsAdapter implements HapticsPort {
  public async trigger(): Promise<HapticTriggerResult> {
    return { code: 'unsupported' };
  }
}
