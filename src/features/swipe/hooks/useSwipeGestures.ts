import * as Haptics from 'expo-haptics';
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
    tx.value = withSpring(0, { damping: 15, stiffness: 150 });
    ty.value = withSpring(0, { damping: 15, stiffness: 150 });
  };

  const completeSwipe = (decision: Decision) => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onSwipeComplete(decision);
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

      const targetX = decision === 'DELETE_STAGED' ? -width * 1.15 : decision === 'KEEP' ? width * 1.15 : 0;
      const targetY = decision === 'FAVORITE' ? -height * 1.1 : decision === 'SKIP_LATER' ? height * 1.1 : 0;

      tx.value = withSpring(targetX, { damping: 15, stiffness: 150 }, (finished) => {
        if (finished) {
          runOnJS(completeSwipe)(decision);
          tx.value = 0;
        }
      });
      ty.value = withSpring(targetY, { damping: 15, stiffness: 150 }, (finished) => {
        if (finished) {
          ty.value = 0;
        }
      });
    });

  return {
    pan,
    tx,
    ty,
  };
};
