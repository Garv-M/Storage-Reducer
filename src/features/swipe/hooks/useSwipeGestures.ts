// Gesture-to-animation hook for the swipe card.
// Keeps pan tracking on the UI thread and bridges final decision handling to JS.

import { Gesture } from 'react-native-gesture-handler';
import { runOnJS, useSharedValue, withSpring } from 'react-native-reanimated';

import { classifySwipe } from '@/features/swipe/logic/swipeThresholds';
import type { Decision } from '@/types/decision';

interface UseSwipeGesturesOptions {
  width: number;
  height: number;
  onSwipeComplete: (decision: Decision) => void;
}

/**
 * Provides pan gesture config and shared translation values for swipe interactions.
 */
export const useSwipeGestures = ({ width, height, onSwipeComplete }: UseSwipeGesturesOptions) => {
  // Shared values are consumed by animated styles without JS re-renders.
  const tx = useSharedValue(0);
  const ty = useSharedValue(0);

  // ── Gesture finalization ────────────────────────────────────────────────────
  const handleEnd = (translationX: number, translationY: number, velocityX: number, velocityY: number) => {
    const decision = classifySwipe(translationX, translationY, velocityX, velocityY, width, height);

    if (!decision) {
      // Re-center card with spring physics when intent does not cross thresholds.
      tx.value = withSpring(0);
      ty.value = withSpring(0);
      return;
    }

    onSwipeComplete(decision);
  };

  const pan = Gesture.Pan()
    .onUpdate((event) => {
      // Continuous drag updates stay in the worklet/UI thread for smooth 60fps motion.
      tx.value = event.translationX;
      ty.value = event.translationY;
    })
    .onEnd((event) => {
      // `handleEnd` is a JS closure; bridge explicitly out of worklet via runOnJS.
      runOnJS(handleEnd)(event.translationX, event.translationY, event.velocityX, event.velocityY);
    });

  return {
    pan,
    tx,
    ty,
  };
};