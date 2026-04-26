// Persisted user preferences for deletion retention, review behavior, and app experience defaults.
// Centralizes toggles so swipe/trash flows read one source of truth.

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
  skipCloudOnly: boolean;
  onboarded: boolean;

  /**
   * Sets retention window (days) for confirmed deletions before physical delete is allowed.
   */
  setRetentionDays: (days: number) => void;

  /**
   * Enables/disables incognito mode preference for new sessions.
   */
  setIncognito: (enabled: boolean) => void;

  /**
   * Sets app theme strategy (explicit or system-following).
   */
  setTheme: (theme: ThemeMode) => void;

  /**
   * Partially updates auto-skip flags while preserving unspecified flags.
   */
  setAutoSkip: (flags: Partial<AutoSkipFlags>) => void;

  /**
   * Legacy-compatible cloud-only toggle.
   * Also mirrors into `autoSkip.cloudOnly` to keep both flags consistent.
   */
  setSkipCloudOnly: (enabled: boolean) => void;

  /**
   * Marks onboarding completion state.
   */
  setOnboarded: (onboarded: boolean) => void;
}

/**
 * Persisted settings store for user preferences consumed across the app.
 */
export const useSettingsStore = create<SettingsStoreState>()(
  persist(
    (set) => ({
      // ── State defaults ──────────────────────────────────────────────────────────
      retentionDays: DEFAULT_RETENTION,
      incognito: false,
      theme: 'system',
      autoSkip: {
        // Hidden media is skipped by default to reduce accidental review of system/private items.
        hidden: true,
        cloudOnly: false,
        shared: false,
      },
      skipCloudOnly: false,
      onboarded: false,

      // ── Actions ─────────────────────────────────────────────────────────────────
      setRetentionDays: (retentionDays) => set({ retentionDays }),
      setIncognito: (incognito) => set({ incognito }),
      setTheme: (theme) => set({ theme }),
      setAutoSkip: (flags) => set((state) => ({ autoSkip: { ...state.autoSkip, ...flags } })),
      setSkipCloudOnly: (enabled) =>
        set((state) => ({
          skipCloudOnly: enabled,
          autoSkip: { ...state.autoSkip, cloudOnly: enabled },
        })),
      setOnboarded: (onboarded) => set({ onboarded }),
    }),
    {
      name: 'settings-store-v1',
      storage: createJSONStorage(() => createMmkvStorage()),
    }
  )
);
