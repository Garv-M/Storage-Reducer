// Zustand storage adapter backed by MMKV with optional per-key write debouncing.
// Debouncing reduces write pressure during rapid state transitions.

import type { StateStorage } from 'zustand/middleware';

import { mmkvDelete, mmkvGetString, mmkvSetString } from '@/services/persistence/mmkv';

// ── Factory ────────────────────────────────────────────────────────────────────

/**
 * Creates a Zustand StateStorage implementation using MMKV.
 *
 * @param debounceMs Delay for coalescing consecutive writes per key.
 */
export const createMmkvStorage = (debounceMs = 0): StateStorage => {
  const timers = new Map<string, ReturnType<typeof setTimeout>>();

  return {
    getItem: (name) => mmkvGetString(name) ?? null,
    setItem: (name, value) => {
      if (debounceMs <= 0) {
        mmkvSetString(name, value);
        return;
      }

      const existingTimer = timers.get(name);
      if (existingTimer) {
        clearTimeout(existingTimer);
      }

      const timer = setTimeout(() => {
        mmkvSetString(name, value);
        timers.delete(name);
      }, debounceMs);

      timers.set(name, timer);
    },
    removeItem: (name) => {
      const existingTimer = timers.get(name);
      if (existingTimer) {
        // Cancel delayed writes to prevent resurrecting a just-removed key.
        clearTimeout(existingTimer);
        timers.delete(name);
      }
      mmkvDelete(name);
    },
  };
};
