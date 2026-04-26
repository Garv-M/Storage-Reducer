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
export type ButtonVariant = 'primary' | 'secondary' | 'destructive' | 'ghost';
export type ButtonSize = 'sm' | 'md' | 'lg';

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
const variantStyles: Record<ButtonVariant, object> = {
  primary: { backgroundColor: colors.blue100, borderWidth: 0 },
  secondary: { backgroundColor: colors.white, borderWidth: 1.5, borderColor: colors.gray50 },
  destructive: { backgroundColor: colors.red100, borderWidth: 0 },
  ghost: { backgroundColor: 'transparent', borderWidth: 0 },
};

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
const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

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
    opacity: disabled ? 0.45 : 1,
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.96, { damping: 15, stiffness: 400 });
  };
  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 400 });
  };
  const handlePress = async () => {
    if (disabled || loading) return;
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
        { height: Math.max(height, 44), paddingHorizontal: paddingH },
        fullWidth && styles.fullWidth,
        animatedStyle,
      ]}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
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
    letterSpacing: 0.1,
  },
});
