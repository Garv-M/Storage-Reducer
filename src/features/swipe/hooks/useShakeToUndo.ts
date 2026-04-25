import { useEffect, useRef } from 'react';

import { Accelerometer } from 'expo-sensors';

interface UseShakeToUndoOptions {
  enabled: boolean;
  onShake: () => void;
}

const SHAKE_THRESHOLD_G = 1.5;
const MIN_SHAKE_WINDOW_MS = 100;
const SHAKE_DEBOUNCE_MS = 1500;

export const useShakeToUndo = ({ enabled, onShake }: UseShakeToUndoOptions) => {
  const aboveThresholdAt = useRef<number | null>(null);
  const lastShakeAt = useRef(0);

  useEffect(() => {
    if (!enabled) return;

    Accelerometer.setUpdateInterval(80);

    const subscription = Accelerometer.addListener((reading) => {
      const now = Date.now();
      const magnitude = Math.sqrt(reading.x ** 2 + reading.y ** 2 + reading.z ** 2);

      if (magnitude >= SHAKE_THRESHOLD_G) {
        if (!aboveThresholdAt.current) {
          aboveThresholdAt.current = now;
          return;
        }

        const heldLongEnough = now - aboveThresholdAt.current >= MIN_SHAKE_WINDOW_MS;
        const pastDebounce = now - lastShakeAt.current >= SHAKE_DEBOUNCE_MS;

        if (heldLongEnough && pastDebounce) {
          lastShakeAt.current = now;
          onShake();
          aboveThresholdAt.current = null;
        }

        return;
      }

      aboveThresholdAt.current = null;
    });

    return () => {
      subscription.remove();
    };
  }, [enabled, onShake]);
};
