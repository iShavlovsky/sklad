import { createJSONStorage, persist } from 'zustand/middleware';
import { createStore } from 'zustand/vanilla';

import type { ScannerSessionTab } from './scanner-session.types.ts';

const SCANNER_PREFERENCES_PERSIST_NAME = 'sklad-scanner-preferences';
const DEFAULT_SCANNER_PREFERRED_TAB: ScannerSessionTab = 'live';

function readInitialScannerPreferencesState(): ScannerPreferencesPersistedState {
  if (typeof window === 'undefined') {
    return {
      preferredTab: DEFAULT_SCANNER_PREFERRED_TAB,
      selectedCameraId: null,
    };
  }

  try {
    const rawValue = window.localStorage.getItem(
      SCANNER_PREFERENCES_PERSIST_NAME
    );

    if (rawValue === null) {
      return {
        preferredTab: DEFAULT_SCANNER_PREFERRED_TAB,
        selectedCameraId: null,
      };
    }

    const parsedValue = JSON.parse(rawValue) as {
      state?: Partial<ScannerPreferencesPersistedState>;
    };
    const preferredTab =
      parsedValue.state?.preferredTab === 'photo'
        ? 'photo'
        : DEFAULT_SCANNER_PREFERRED_TAB;
    const selectedCameraId =
      typeof parsedValue.state?.selectedCameraId === 'string'
        ? parsedValue.state.selectedCameraId
        : null;

    return {
      preferredTab,
      selectedCameraId,
    };
  } catch {
    return {
      preferredTab: DEFAULT_SCANNER_PREFERRED_TAB,
      selectedCameraId: null,
    };
  }
}

export function getPreferredScannerTab(): ScannerSessionTab {
  const { preferredTab } = scannerPreferencesStore.getState();

  if (preferredTab === 'photo') {
    return preferredTab;
  }

  return readInitialScannerPreferencesState().preferredTab;
}

interface ScannerPreferencesPersistedState {
  preferredTab: ScannerSessionTab;
  selectedCameraId: string | null;
}

interface ScannerPreferencesState extends ScannerPreferencesPersistedState {
  setPreferredTab: (preferredTab: ScannerSessionTab) => void;
  setSelectedCameraId: (selectedCameraId: string | null) => void;
  clearPreferredTab: () => void;
  clearSelectedCameraId: () => void;
}

export const scannerPreferencesStore = createStore<ScannerPreferencesState>()(
  persist(
    (set) => ({
      ...readInitialScannerPreferencesState(),
      setPreferredTab: (preferredTab): void => {
        set({
          preferredTab,
        });
      },
      setSelectedCameraId: (selectedCameraId): void => {
        set({
          selectedCameraId,
        });
      },
      clearPreferredTab: (): void => {
        set({
          preferredTab: DEFAULT_SCANNER_PREFERRED_TAB,
        });
      },
      clearSelectedCameraId: (): void => {
        set({
          selectedCameraId: null,
        });
      },
    }),
    {
      name: SCANNER_PREFERENCES_PERSIST_NAME,
      partialize: (state): ScannerPreferencesPersistedState => ({
        preferredTab: state.preferredTab,
        selectedCameraId: state.selectedCameraId,
      }),
      storage: createJSONStorage(() => localStorage),
    }
  )
);
