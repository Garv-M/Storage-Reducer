// UI Primitive: ProgressBar
// Displays determinate progress for multi-step and long-running operations.
// Uses Reanimated-driven width interpolation for smooth visual updates without
// relying on layout animations.

import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

import { colors } from '@/ui/theme/colors';

// ── Types ─────────────────────────────────────────────────────────────────────
/**
 * Props for the ProgressBar primitive.
 */
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
/**
 * Determinate progress indicator with optional spring animation.
 */
export function ProgressBar({
  progress,
  color = colors.blue100,
  trackColor = colors.gray10,
  height = 6,
  animated = true,
  accessibilityLabel = 'Progress indicator',
}: ProgressBarProps) {
  const clamped = Math.min(1, Math.max(0, progress));

  // Keep shared value in percentage space to simplify animation and avoid
  // fractional precision edge cases from repeatedly animating 0..1 floats.
  const pct = useSharedValue(clamped * 100);

  useEffect(() => {
    if (animated) {
      pct.value = withSpring(clamped * 100, {
        // Slightly damped spring avoids jitter while still feeling responsive.
        damping: 20,
        stiffness: 180,
        // Disable overshoot so fill never visually exceeds 100%.
        overshootClamping: true,
      });
    } else {
      pct.value = clamped * 100;
    }
  }, [clamped, animated]);

  const fillStyle = useAnimatedStyle(() => ({
    // Percentage width keeps the bar responsive to parent size changes.
    width: `${pct.value}%`,
  }));

  return (
    <View
      style={[styles.track, { backgroundColor: trackColor, height, borderRadius: height / 2 }]}
      accessible
      accessibilityRole="progressbar"
      accessibilityLabel={accessibilityLabel}
      // Expose numeric progress for screen readers.
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
