import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { DEFAULT_RETENTION } from '@/constants/retention';
import { createMmkvStorage } from '@/services/persistence/zustandStorage';

export interface AutoSkipFlags {
  hidden: boolean;
  cloudOnly: boolean;
  shared: boolean;
}

type ThemeMode = 'light' | 'dark' | 'system';

interface SettingsStoreState {
  retentionDays: number;
  incognito: boolean;
  theme: ThemeMode;
  autoSkip: AutoSkipFlags;
  onboarded: boolean;
  setRetentionDays: (days: number) => void;
  setIncognito: (enabled: boolean) => void;
  setTheme: (theme: ThemeMode) => void;
  setAutoSkip: (flags: Partial<AutoSkipFlags>) => void;
  setOnboarded: (onboarded: boolean) => void;
}

export const useSettingsStore = create<SettingsStoreState>()(
  persist(
    (set) => ({
      retentionDays: DEFAULT_RETENTION,
      incognito: false,
      theme: 'system',
      autoSkip: {
        hidden: true,
        cloudOnly: false,
        shared: false,
      },
      onboarded: false,
      setRetentionDays: (retentionDays) => set({ retentionDays }),
      setIncognito: (incognito) => set({ incognito }),
      setTheme: (theme) => set({ theme }),
      setAutoSkip: (flags) => set((state) => ({ autoSkip: { ...state.autoSkip, ...flags } })),
      setOnboarded: (onboarded) => set({ onboarded }),
    }),
    {
      name: 'settings-store-v1',
      storage: createJSONStorage(() => createMmkvStorage()),
    }
  )
);
