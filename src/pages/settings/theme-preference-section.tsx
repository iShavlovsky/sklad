import type { ReactElement } from 'react';
import { Select, Stack } from '@mantine/core';

import { useUiSettings } from '@/features/settings/model/use-ui-settings';
import {
  THEME_PREFERENCE_LABELS,
  THEME_PREFERENCE_OPTIONS,
  type ThemePreference,
} from '@/shared/types/ui-settings';
import { PageSection } from '@/shared/ui/page-section';

export function ThemePreferenceSection(): ReactElement {
  const { settings, setThemePreference } = useUiSettings();

  return (
    <PageSection
      badge="Тема"
      description="Выберите фиксированный светлый или тёмный режим интерфейса."
      title="Оформление"
    >
      <Stack gap="md">
        <Select
          data={THEME_PREFERENCE_OPTIONS.map((value) => ({
            value,
            label: THEME_PREFERENCE_LABELS[value],
          }))}
          data-testid="settings-theme-preference-select"
          label="Режим темы"
          value={settings.themePreference}
          onChange={(value: ThemePreference | null) => {
            if (value) {
              void setThemePreference(value);
            }
          }}
        />
      </Stack>
    </PageSection>
  );
}
