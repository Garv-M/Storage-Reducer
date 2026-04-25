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

  const reset = () => {
    tx.value = withSpring(0);
    ty.value = withSpring(0);
  };

  const pan = Gesture.Pan()
    .onUpdate((event) => {
      tx.value = event.translationX;
      ty.value = event.translationY;
    })
    .onEnd((event) => {
      const decision = classifySwipe(
        event.translationX,
        event.translationY,
        event.velocityX,
        event.velocityY,
        width,
        height
      );

      if (!decision) {
        tx.value = withSpring(0);
        ty.value = withSpring(0);
        return;
      }

      runOnJS(onSwipeComplete)(decision);
      runOnJS(reset)();
    });

  return {
    pan,
    tx,
    ty,
  };
};
