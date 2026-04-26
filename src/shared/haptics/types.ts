export type HapticPattern = number | readonly number[];

export type HapticPreset =
  | 'selection'
  | 'impact-light'
  | 'impact-medium'
  | 'impact-heavy'
  | 'success'
  | 'warning'
  | 'error';

export type HapticTriggerSource = 'custom-pattern' | 'preset';

export type HapticCapability =
  | {
      supported: true;
      reason: 'available';
    }
  | {
      supported: false;
      reason: 'navigator-missing' | 'vibrate-missing';
    };

export type TriggerHapticInput =
  | {
      source: 'custom-pattern';
      pattern: HapticPattern;
    }
  | {
      source: 'preset';
      preset: HapticPreset;
    };

export type TriggerHapticResult =
  | {
      ok: true;
      status: 'triggered';
      source: HapticTriggerSource;
      pattern: readonly number[];
    }
  | {
      ok: false;
      status: 'disabled' | 'unsupported' | 'invalid-pattern' | 'rejected';
      source: HapticTriggerSource;
      pattern: readonly number[];
      reason: string;
    };

export type BrowserHapticsOptions = {
  enabled?: boolean;
  navigator?: Pick<Navigator, 'vibrate'> | null;
  presets?: Partial<Record<HapticPreset, HapticPattern>>;
};

export type BrowserHaptics = {
  isEnabled(): boolean;
  getCapability(): HapticCapability;
  trigger(input: TriggerHapticInput): TriggerHapticResult;
  triggerPreset(preset: HapticPreset): TriggerHapticResult;
};
