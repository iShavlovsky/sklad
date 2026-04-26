import type {
  BrowserHaptics,
  BrowserHapticsOptions,
  HapticCapability,
  HapticPattern,
  HapticPreset,
  TriggerHapticInput,
  TriggerHapticResult,
} from '@/shared/haptics/types';

const DEFAULT_HAPTIC_PRESETS: Record<HapticPreset, readonly number[]> = {
  selection: [12],
  'impact-light': [14],
  'impact-medium': [20],
  'impact-heavy': [28],
  success: [18, 36, 18],
  warning: [24, 44, 24, 44, 24],
  error: [30, 48, 30],
};

function getDefaultNavigator(): Pick<Navigator, 'vibrate'> | null {
  if (typeof navigator === 'undefined') return null;
  return navigator;
}

function normalizePattern(pattern: HapticPattern): readonly number[] | null {
  const values = Array.isArray(pattern) ? pattern : [pattern];
  if (values.length === 0) return null;

  const normalized = values.map((value) =>
    Number.isFinite(value) ? Math.max(0, Math.round(value)) : Number.NaN
  );

  if (normalized.some((value) => Number.isNaN(value))) {
    return null;
  }

  if (normalized.every((value) => value === 0)) {
    return null;
  }

  return normalized;
}

function getCapability(
  targetNavigator: Pick<Navigator, 'vibrate'> | null
): HapticCapability {
  if (!targetNavigator) {
    return {
      supported: false,
      reason: 'navigator-missing',
    };
  }

  if (typeof targetNavigator.vibrate !== 'function') {
    return {
      supported: false,
      reason: 'vibrate-missing',
    };
  }

  return {
    supported: true,
    reason: 'available',
  };
}

export function createBrowserHaptics(
  options: BrowserHapticsOptions = {}
): BrowserHaptics {
  const targetNavigator = options.navigator ?? getDefaultNavigator();
  const mergedPresets: Record<HapticPreset, HapticPattern> = {
    ...DEFAULT_HAPTIC_PRESETS,
    ...options.presets,
  };

  function resolvePattern(input: TriggerHapticInput): readonly number[] | null {
    if (input.source === 'preset') {
      return normalizePattern(mergedPresets[input.preset]);
    }

    return normalizePattern(input.pattern);
  }

  function trigger(input: TriggerHapticInput): TriggerHapticResult {
    const { source } = input;
    const pattern = resolvePattern(input) ?? [];

    if (options.enabled === false) {
      return {
        ok: false,
        status: 'disabled',
        source,
        pattern,
        reason: 'Haptics are disabled by configuration.',
      };
    }

    const capability = getCapability(targetNavigator);
    if (!capability.supported) {
      return {
        ok: false,
        status: 'unsupported',
        source,
        pattern,
        reason: `Browser haptics are not available: ${capability.reason}.`,
      };
    }

    if (pattern.length === 0) {
      return {
        ok: false,
        status: 'invalid-pattern',
        source,
        pattern,
        reason: 'Haptic pattern must contain at least one positive duration.',
      };
    }

    const vibrate = targetNavigator?.vibrate;
    if (typeof vibrate !== 'function') {
      return {
        ok: false,
        status: 'unsupported',
        source,
        pattern,
        reason: 'Browser haptics are not available: vibrate-missing.',
      };
    }

    const accepted = vibrate.call(targetNavigator, pattern);
    if (!accepted) {
      return {
        ok: false,
        status: 'rejected',
        source,
        pattern,
        reason: 'The browser rejected the vibrate request.',
      };
    }

    return {
      ok: true,
      status: 'triggered',
      source,
      pattern,
    };
  }

  return {
    isEnabled() {
      return options.enabled !== false;
    },
    getCapability() {
      return getCapability(targetNavigator);
    },
    trigger,
    triggerPreset(preset) {
      return trigger({
        source: 'preset',
        preset,
      });
    },
  };
}

export { DEFAULT_HAPTIC_PRESETS };
