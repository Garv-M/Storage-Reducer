import { useSettingsStore } from '@/stores/settingsStore';

type TrackerPayload = Record<string, unknown>;

const shouldSkip = () => useSettingsStore.getState().incognito;

export const Tracker = {
  track(event: string, payload?: TrackerPayload) {
    if (shouldSkip()) return;
    // Placeholder sink for future analytics SDK integration.
    console.info('[Tracker]', event, payload ?? {});
  },

  screen(name: string, payload?: TrackerPayload) {
    if (shouldSkip()) return;
    console.info('[Tracker:screen]', name, payload ?? {});
  },
};
