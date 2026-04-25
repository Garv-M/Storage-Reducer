import { Gesture } from 'react-native-gesture-handler';
import { runOnJS, useSharedValue, withSpring } from 'react-native-reanimated';

import { classifySwipe } from '@/features/swipe/logic/swipeThresholds';
import type { Decision } from '@/types/decision';

interface UseSwipeGesturesOptions {
  width: number;
  height: number;
  onSwipeComplete: (decision: Decision) => void;
}

export const useSwipeGestures = ({ width, height, onSwipeComplete }: UseSwipeGesturesOptions) => {
  const tx = useSharedValue(0);
  const ty = useSharedValue(0);

  const handleEnd = (translationX: number, translationY: number, velocityX: number, velocityY: number) => {
    const decision = classifySwipe(translationX, translationY, velocityX, velocityY, width, height);

    if (!decision) {
      tx.value = withSpring(0);
      ty.value = withSpring(0);
      return;
    }

    onSwipeComplete(decision);
  };

  const pan = Gesture.Pan()
    .onUpdate((event) => {
      tx.value = event.translationX;
      ty.value = event.translationY;
    })
    .onEnd((event) => {
      runOnJS(handleEnd)(event.translationX, event.translationY, event.velocityX, event.velocityY);
    });

  return {
    pan,
    tx,
    ty,
  };
};
