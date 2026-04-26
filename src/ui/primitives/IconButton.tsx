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
export type IconButtonVariant = 'primary' | 'secondary' | 'ghost' | 'destructive';

export interface IconButtonProps {
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  /** Outer diameter. Minimum clamped to 44pt for accessibility. */
  size?: number;
  variant?: IconButtonVariant;
  disabled?: boolean;
  accessibilityLabel: string; // required for icon-only controls
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
const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function IconButton({
  icon,
  onPress,
  size = 48,
  variant = 'secondary',
  disabled = false,
  accessibilityLabel,
}: IconButtonProps) {
  const clampedSize = Math.max(size, 44);
  const iconSize = Math.round(clampedSize * 0.46);

  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: disabled ? 0.45 : 1,
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.9, { damping: 14, stiffness: 420 });
  };
  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 14, stiffness: 420 });
  };
  const handlePress = async () => {
    if (disabled) return;
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
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
      accessibilityState={{ disabled }}
      style={[
        styles.base,
        {
          width: clampedSize,
          height: clampedSize,
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
