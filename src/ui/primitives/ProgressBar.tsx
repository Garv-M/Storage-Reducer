import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

import { colors } from '@/ui/theme/colors';

// ── Types ─────────────────────────────────────────────────────────────────────
export interface ProgressBarProps {
  /** Value between 0 and 1. */
  progress: number;
  color?: string;
  trackColor?: string;
  height?: number;
  animated?: boolean;
  accessibilityLabel?: string;
}

// ── Component ─────────────────────────────────────────────────────────────────
export function ProgressBar({
  progress,
  color = colors.blue100,
  trackColor = colors.gray10,
  height = 6,
  animated = true,
  accessibilityLabel = 'Progress indicator',
}: ProgressBarProps) {
  const clamped = Math.min(1, Math.max(0, progress));

  // We use 0–100 for the shared value to avoid float precision edge cases.
  const pct = useSharedValue(clamped * 100);

  useEffect(() => {
    if (animated) {
      pct.value = withSpring(clamped * 100, {
        damping: 20,
        stiffness: 180,
        overshootClamping: true,
      });
    } else {
      pct.value = clamped * 100;
    }
  }, [clamped, animated]);

  const fillStyle = useAnimatedStyle(() => ({
    width: `${pct.value}%`,
  }));

  return (
    <View
      style={[styles.track, { backgroundColor: trackColor, height, borderRadius: height / 2 }]}
      accessible
      accessibilityRole="progressbar"
      accessibilityLabel={accessibilityLabel}
      accessibilityValue={{ min: 0, max: 100, now: Math.round(clamped * 100) }}
    >
      <Animated.View
        style={[
          styles.fill,
          { backgroundColor: color, height, borderRadius: height / 2 },
          fillStyle,
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    width: '100%',
    overflow: 'hidden',
  },
  fill: {
    position: 'absolute',
    left: 0,
    top: 0,
  },
});
