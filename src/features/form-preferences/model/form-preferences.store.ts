import { createJSONStorage, persist } from 'zustand/middleware';
import { createStore } from 'zustand/vanilla';

import type {
  FormPreferenceKey,
  FormPreferencesPersistedState,
  FormPreferencesState,
  FormPreferenceValue,
} from './form-preferences.types.ts';

const FORM_PREFERENCES_PERSIST_NAME = 'sklad-form-preferences';

function readInitialFormPreferencesState(): FormPreferencesPersistedState {
  if (typeof window === 'undefined') {
    return { values: {} };
  }

  try {
    const rawValue = window.localStorage.getItem(FORM_PREFERENCES_PERSIST_NAME);

    if (rawValue === null) {
      return { values: {} };
    }

    const parsedValue = JSON.parse(rawValue) as {
      state?: FormPreferencesPersistedState;
    };

    return {
      values: parsedValue.state?.values ?? {},
    };
  } catch {
    return { values: {} };
  }
}

export const formPreferencesStore = createStore<FormPreferencesState>()(
  persist(
    (set) => ({
      ...readInitialFormPreferencesState(),
      rememberValue: (key, value): void => {
        set((state) => ({
          values: {
            ...state.values,
            [key]: value,
          },
        }));
      },
      forgetValue: (key): void => {
        set((state) => {
          const nextValues = Object.fromEntries(
            Object.entries(state.values).filter(
              ([entryKey]) => entryKey !== key
            )
          ) as FormPreferencesPersistedState['values'];

          return {
            values: nextValues,
          };
        });
      },
    }),
    {
      name: FORM_PREFERENCES_PERSIST_NAME,
      partialize: (state): FormPreferencesPersistedState => ({
        values: state.values,
      }),
      storage: createJSONStorage(() => localStorage),
    }
  )
);

export function readRememberedFormPreference<
  TValue extends FormPreferenceValue,
>(key: FormPreferenceKey, fallback: TValue): TValue {
  const storedValue = formPreferencesStore.getState().values[key];

  if (typeof fallback === 'boolean') {
    return (
      typeof storedValue === 'boolean' ? storedValue : fallback
    ) as TValue;
  }

  return (typeof storedValue === 'string' ? storedValue : fallback) as TValue;
}
