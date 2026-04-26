// Directional overlay badges for swipe intent feedback.
// Reinforces gesture-to-action mapping before a swipe threshold is crossed.

import { Ionicons } from '@expo/vector-icons';
import { StyleSheet } from 'react-native';
import Animated, {
  Extrapolation,
  SharedValue,
  interpolate,
  useAnimatedStyle,
} from 'react-native-reanimated';

import { DECISION_COLORS } from '@/features/swipe/logic/decisions';
import { Text } from '@/ui/primitives/Text';
import { colors } from '@/ui/theme/colors';

interface SwipeActionOverlayProps {
  tx: SharedValue<number>;
  ty: SharedValue<number>;
  width: number;
  height: number;
}

// ── Helpers ───────────────────────────────────────────────────────────────────
/**
 * Converts a hex color to rgba with configurable alpha.
 */
function hexAlpha(hex: string, alpha: number) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

const DELETE_BG = hexAlpha(DECISION_COLORS.DELETE_STAGED, 0.88);
const KEEP_BG = hexAlpha(DECISION_COLORS.KEEP, 0.88);
const FAVORITE_BG = hexAlpha(DECISION_COLORS.FAVORITE, 0.88);
const SKIP_BG = hexAlpha(DECISION_COLORS.SKIP_LATER, 0.88);

// ── Component ─────────────────────────────────────────────────────────────────
/**
 * Renders directional action badges that fade/scale with drag distance.
 */
export function SwipeActionOverlay({ tx, ty, width, height }: SwipeActionOverlayProps) {
  const leftStyle = useAnimatedStyle(() => {
    const drag = -tx.value; // positive when dragging left
    return {
      opacity: interpolate(drag, [0, width * 0.15], [0, 1], Extrapolation.CLAMP),
      transform: [
        {
          scale: interpolate(drag, [0, width * 0.3], [0.6, 1.12], Extrapolation.CLAMP),
        },
      ],
    };
  });

  const rightStyle = useAnimatedStyle(() => {
    const drag = tx.value; // positive when dragging right
    return {
      opacity: interpolate(drag, [0, width * 0.15], [0, 1], Extrapolation.CLAMP),
      transform: [
        {
          scale: interpolate(drag, [0, width * 0.3], [0.6, 1.12], Extrapolation.CLAMP),
        },
      ],
    };
  });

  const topStyle = useAnimatedStyle(() => {
    const drag = -ty.value; // positive when dragging up
    return {
      opacity: interpolate(drag, [0, height * 0.15], [0, 1], Extrapolation.CLAMP),
      transform: [
        {
          scale: interpolate(drag, [0, height * 0.3], [0.6, 1.12], Extrapolation.CLAMP),
        },
      ],
    };
  });

  const bottomStyle = useAnimatedStyle(() => {
    const drag = ty.value; // positive when dragging down
    return {
      opacity: interpolate(drag, [0, height * 0.15], [0, 1], Extrapolation.CLAMP),
      transform: [
        {
          scale: interpolate(drag, [0, height * 0.3], [0.6, 1.12], Extrapolation.CLAMP),
        },
      ],
    };
  });

  return (
    <>
      <Animated.View
        style={[styles.badge, styles.left, { backgroundColor: DELETE_BG, shadowColor: DECISION_COLORS.DELETE_STAGED }, leftStyle]}
        // Decorative feedback only; card-level accessibility already explains gesture outcomes.
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
      >
        <Ionicons name="trash-outline" size={20} color={colors.white} style={styles.icon} />
        <Text variant="label" weight="bold" color={colors.white} style={styles.label}>DELETE</Text>
      </Animated.View>

      <Animated.View
        style={[styles.badge, styles.right, { backgroundColor: KEEP_BG, shadowColor: DECISION_COLORS.KEEP }, rightStyle]}
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
      >
        <Ionicons name="checkmark-circle" size={20} color={colors.white} style={styles.icon} />
        <Text variant="label" weight="bold" color={colors.white} style={styles.label}>KEEP</Text>
      </Animated.View>

      <Animated.View
        style={[styles.badge, styles.top, { backgroundColor: FAVORITE_BG, shadowColor: DECISION_COLORS.FAVORITE }, topStyle]}
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
      >
        <Ionicons name="heart" size={20} color={colors.white} style={styles.icon} />
        <Text variant="label" weight="bold" color={colors.white} style={styles.label}>FAVORITE</Text>
      </Animated.View>

      <Animated.View
        style={[styles.badge, styles.bottom, { backgroundColor: SKIP_BG, shadowColor: DECISION_COLORS.SKIP_LATER }, bottomStyle]}
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
      >
        <Ionicons name="time-outline" size={20} color={colors.white} style={styles.icon} />
        <Text variant="label" weight="bold" color={colors.white} style={styles.label}>SKIP</Text>
      </Animated.View>
    </>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  badge: {
    position: 'absolute',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 999,
    zIndex: 40,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 12,
    elevation: 8,
  },
  left: {
    left: 16,
    top: '50%',
    transform: [{ translateY: -22 }],
  },
  right: {
    right: 16,
    top: '50%',
    transform: [{ translateY: -22 }],
  },
  top: {
    top: 24,
    alignSelf: 'center',
  },
  bottom: {
    bottom: 24,
    alignSelf: 'center',
  },
  icon: {
    marginRight: 6,
  },
  label: {
    letterSpacing: 0.5,
  },
});
