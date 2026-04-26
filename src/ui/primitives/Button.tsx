// UI Primitive: Button
// Action control for primary and secondary flows in the Walmart-themed system.
// This primitive centralizes motion, haptics, sizing, and accessibility so all
// call-to-action patterns feel consistent across the app.

import * as Haptics from 'expo-haptics';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

import { colors } from '@/ui/theme/colors';
import { fontFamilies, fontSizes } from '@/ui/theme/typography';

// ── Types ─────────────────────────────────────────────────────────────────────
/**
 * Visual intent variants for Button.
 */
export type ButtonVariant = 'primary' | 'secondary' | 'destructive' | 'ghost';

/**
 * Predefined size options controlling height, padding, and font size.
 */
export type ButtonSize = 'sm' | 'md' | 'lg';

/**
 * Props for the Button primitive.
 */
export interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  fullWidth?: boolean;
  accessibilityLabel?: string;
}

// ── Style maps ────────────────────────────────────────────────────────────────
// Keep variant styling token-driven so feature screens do not re-implement
// Walmart button semantics in ad-hoc style objects.
const variantStyles: Record<ButtonVariant, object> = {
  primary: { backgroundColor: colors.blue100, borderWidth: 0 },
  secondary: { backgroundColor: colors.white, borderWidth: 1.5, borderColor: colors.gray50 },
  destructive: { backgroundColor: colors.red100, borderWidth: 0 },
  ghost: { backgroundColor: 'transparent', borderWidth: 0 },
};

// Text color is paired with each variant for contrast/readability.
const labelColors: Record<ButtonVariant, string> = {
  primary: colors.white,
  secondary: colors.gray180,
  destructive: colors.white,
  ghost: colors.blue100,
};

const sizeHeights: Record<ButtonSize, number> = { sm: 40, md: 48, lg: 56 };
const sizeFontSizes: Record<ButtonSize, number> = {
  sm: fontSizes.sm,
  md: fontSizes.md,
  lg: fontSizes.lg,
};
const sizePadding: Record<ButtonSize, number> = { sm: 16, md: 20, lg: 24 };

// ── Component ─────────────────────────────────────────────────────────────────
// Wrap Pressable so scaling animation runs on the UI thread via Reanimated.
const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

/**
 * Standard button primitive with variant styling, press animation, and haptics.
 */
export function Button({
  label,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  icon,
  fullWidth = false,
  accessibilityLabel,
}: ButtonProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    // Dim disabled controls to communicate non-interactive state visually.
    opacity: disabled ? 0.45 : 1,
  }));

  const handlePressIn = () => {
    // 0.96 gives clear tactile compression without feeling jumpy on larger CTAs.
    scale.value = withSpring(0.96, { damping: 15, stiffness: 400 });
  };
  const handlePressOut = () => {
    // Same spring params on release keep motion symmetric and predictable.
    scale.value = withSpring(1, { damping: 15, stiffness: 400 });
  };
  const handlePress = async () => {
    if (disabled || loading) return;
    // Light impact is used for every press to provide subtle physical confirmation
    // without overwhelming repetitive interactions.
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  };

  const height = sizeHeights[size];
  const fontSize = sizeFontSizes[size];
  const paddingH = sizePadding[size];
  const labelColor = labelColors[variant];

  return (
    <AnimatedPressable
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled || loading}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityState={{ disabled: disabled || loading, busy: loading }}
      style={[
        styles.base,
        variantStyles[variant],
        // Clamp to >=44pt touch target to satisfy WCAG 2.2 AA pointer target size.
        { height: Math.max(height, 44), paddingHorizontal: paddingH },
        fullWidth && styles.fullWidth,
        animatedStyle,
      ]}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          // Secondary/ghost are light surfaces, so spinner uses blue for contrast.
          color={variant === 'secondary' || variant === 'ghost' ? colors.blue100 : colors.white}
        />
      ) : (
        <View style={styles.inner}>
          {icon && <View style={styles.iconWrap}>{icon}</View>}
          <Text
            style={[styles.label, { color: labelColor, fontSize, fontFamily: fontFamilies.semibold }]}
            numberOfLines={1}
          >
            {label}
          </Text>
        </View>
      )}
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    // Enforces minimum target width for icon-only/narrow labels.
    minWidth: 44,
  },
  fullWidth: {
    width: '100%',
  },
  inner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconWrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    // Slight tracking improves readability for medium/bold UI labels.
    letterSpacing: 0.1,
  },
});
