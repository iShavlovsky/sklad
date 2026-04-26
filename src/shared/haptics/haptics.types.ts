export type HapticPattern =
  | 'tap'
  | 'selection'
  | 'success'
  | 'warning'
  | 'error'
  | 'confirm';

export type HapticTriggerResult =
  | {
      code: 'unsupported';
    }
  | {
      code: 'suppressed';
    }
  | {
      code: 'triggered';
    };

export interface HapticsPort {
  trigger: (pattern: HapticPattern) => Promise<HapticTriggerResult>;
}
