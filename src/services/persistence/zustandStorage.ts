import type { StateStorage } from 'zustand/middleware';

import { mmkvDelete, mmkvGetString, mmkvSetString } from '@/services/persistence/mmkv';

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
        clearTimeout(existingTimer);
        timers.delete(name);
      }
      mmkvDelete(name);
    },
  };
};
