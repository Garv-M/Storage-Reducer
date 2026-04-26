// UI Primitive: IconButton
// Compact circular action control for icon-only affordances (close, trash, etc.).
// Encapsulates stronger press feedback than standard buttons to compensate for
// smaller visual footprint while preserving minimum accessible hit area.

import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Pressable, StyleSheet } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

import { colors } from '@/ui/theme/colors';

// ── Types ─────────────────────────────────────────────────────────────────────
/**
 * Visual intent variants for icon-only actions.
 */
export type IconButtonVariant = 'primary' | 'secondary' | 'ghost' | 'destructive';

/**
 * Props for the IconButton primitive.
 */
export interface IconButtonProps {
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  /** Outer diameter. Minimum clamped to 44pt for accessibility. */
  size?: number;
  variant?: IconButtonVariant;
  disabled?: boolean;
  accessibilityLabel: string; // required for icon-only controls
  accessibilityHint?: string;
  hapticStyle?: 'light' | 'medium' | 'heavy';
}

// ── Variant lookups ───────────────────────────────────────────────────────────
const bgColors: Record<IconButtonVariant, string> = {
  primary: colors.blue100,
  secondary: colors.white,
  ghost: 'transparent',
  destructive: colors.red100,
};
const iconColors: Record<IconButtonVariant, string> = {
  primary: colors.white,
  secondary: colors.gray180,
  ghost: colors.gray160,
  destructive: colors.white,
};
const borderColors: Record<IconButtonVariant, string | undefined> = {
  primary: undefined,
  secondary: colors.gray50,
  ghost: undefined,
  destructive: undefined,
};

// ── Component ─────────────────────────────────────────────────────────────────
// Animated wrapper keeps press-scale interaction smooth on the UI thread.
const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

/**
 * Circular icon-only button with haptic and spring-press feedback.
 */
export function IconButton({
  icon,
  onPress,
  size = 48,
  variant = 'secondary',
  disabled = false,
  accessibilityLabel,
  accessibilityHint,
  hapticStyle = 'light',
}: IconButtonProps) {
  // Clamp diameter to ensure at least 44pt target (WCAG 2.2 AA requirement).
  const clampedSize = Math.max(size, 44);
  // Icon occupies ~46% of button diameter for legibility without crowding edges.
  const iconSize = Math.round(clampedSize * 0.46);

  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: disabled ? 0.45 : 1,
  }));

  const handlePressIn = () => {
    // Stronger compression than Button (0.90 vs 0.96) because smaller controls
    // benefit from more pronounced tactile feedback.
    scale.value = withSpring(0.9, { damping: 14, stiffness: 420 });
  };
  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 14, stiffness: 420 });
  };
  const handlePress = async () => {
    if (disabled) return;
    const styleMap = {
      light: Haptics.ImpactFeedbackStyle.Light,
      medium: Haptics.ImpactFeedbackStyle.Medium,
      heavy: Haptics.ImpactFeedbackStyle.Heavy,
    };
    // Caller-controlled haptic weight supports context-sensitive emphasis
    // (e.g., heavy for destructive, light for neutral utility actions).
    await Haptics.impactAsync(styleMap[hapticStyle]);
    onPress();
  };

  const borderStyle =
    borderColors[variant] != null
      ? { borderWidth: 1.5, borderColor: borderColors[variant] }
      : {};

  return (
    <AnimatedPressable
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled }}
      style={[
        styles.base,
        {
          width: clampedSize,
          height: clampedSize,
          // Always circular regardless of size variant.
          borderRadius: clampedSize / 2,
          backgroundColor: bgColors[variant],
        },
        borderStyle,
        animatedStyle,
      ]}
    >
      <Ionicons name={icon} size={iconSize} color={iconColors[variant]} />
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
