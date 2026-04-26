import { useCallback, useMemo } from 'react';
import { useColorScheme } from '@mantine/hooks';

import { useSaveSetting } from '@/features/settings/hooks/use-save-setting';
import { useSettingDetails } from '@/features/settings/hooks/use-setting-details';
import {
  isThemePreference,
  parseThemePreference,
  THEME_PREFERENCE_KEY,
  type ThemePreference,
} from '@/shared/types/ui-settings.ts';

export interface UiThemeSettingsValues {
  themePreference: ThemePreference;
}

export function useUiSettings(): {
  settings: UiThemeSettingsValues;
  setThemePreference: (themePreference: ThemePreference) => Promise<void>;
} {
  const systemColorScheme = useColorScheme('light', {
    getInitialValueInEffect: false,
  });
  const saveSetting = useSaveSetting();
  const themePreferenceSetting = useSettingDetails(THEME_PREFERENCE_KEY);
  const themePreferenceValue = themePreferenceSetting?.setting?.value;

  const themePreference = useMemo(
    () => parseThemePreference(themePreferenceValue) ?? systemColorScheme,
    [systemColorScheme, themePreferenceValue]
  );

  const setThemePreference = useCallback(
    async (nextThemePreference: ThemePreference): Promise<void> => {
      if (!isThemePreference(nextThemePreference)) return;
      await saveSetting.execute({
        key: THEME_PREFERENCE_KEY,
        value: nextThemePreference,
      });
    },
    [saveSetting]
  );

  return {
    settings: {
      themePreference,
    },
    setThemePreference,
  };
}
