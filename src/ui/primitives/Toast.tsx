// UI Primitive: Toast
// Transient status message that appears near the top safe area.
// Top-entry motion avoids common keyboard and bottom inset conflicts seen in
// mobile forms and modal-heavy flows.

import { Ionicons } from '@expo/vector-icons';
import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors } from '@/ui/theme/colors';
import { fontFamilies, fontSizes } from '@/ui/theme/typography';

// ── Types ─────────────────────────────────────────────────────────────────────
/**
 * Supported semantic tones for toast feedback.
 */
export type ToastType = 'success' | 'error' | 'info';

/**
 * Props for the Toast primitive.
 */
export interface ToastProps {
  message: string;
  type?: ToastType;
  visible: boolean;
  /** Called after the toast auto-dismisses. */
  onDismiss?: () => void;
  /** Auto-dismiss delay in ms. Default 3000. */
  duration?: number;
}

// ── Style maps ────────────────────────────────────────────────────────────────
const toastBg: Record<ToastType, string> = {
  success: colors.green100,
  error: colors.red100,
  info: colors.blue100,
};

const toastIcons: Record<ToastType, keyof typeof Ionicons.glyphMap> = {
  success: 'checkmark-circle',
  error: 'alert-circle',
  info: 'information-circle',
};

// ── Component ─────────────────────────────────────────────────────────────────
/**
 * Animated toast banner with auto-dismiss behavior.
 */
export function Toast({
  message,
  type = 'info',
  visible,
  onDismiss,
  duration = 3000,
}: ToastProps) {
  const insets = useSafeAreaInsets();
  const translateY = useSharedValue(-120);
  const opacity = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));

  useEffect(() => {
    if (visible) {
      // Enter from above to avoid collision with bottom keyboards/sheets.
      translateY.value = withSpring(0, { damping: 18, stiffness: 280 });
      opacity.value = withTiming(1, { duration: 150 });

      // Auto-dismiss sequencing uses delay on the UI thread for reliable timing,
      // then runOnJS to notify React state after animation completion.
      translateY.value = withDelay(
        duration,
        withSpring(-120, { damping: 18, stiffness: 280 }, (finished) => {
          if (finished && onDismiss) runOnJS(onDismiss)();
        })
      );
      opacity.value = withDelay(duration, withTiming(0, { duration: 200 }));
    } else {
      translateY.value = withSpring(-120, { damping: 18, stiffness: 280 });
      opacity.value = withTiming(0, { duration: 150 });
    }
  }, [visible]);

  return (
    <Animated.View
      style={[
        styles.container,
        { backgroundColor: toastBg[type], top: insets.top + 12 },
        animatedStyle,
      ]}
      accessibilityRole="alert"
      // "polite" announces updates without interrupting active screen-reader speech.
      accessibilityLiveRegion="polite"
      accessibilityLabel={`${type}: ${message}`}
      // Toast is informational only; touches should pass through.
      pointerEvents="none"
    >
      <Ionicons name={toastIcons[type]} size={20} color={colors.white} />
      <Text style={styles.message} numberOfLines={2}>
        {message}
      </Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 14,
    zIndex: 9999,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  message: {
    flex: 1,
    color: colors.white,
    fontSize: fontSizes.sm,
    fontFamily: fontFamilies.medium,
    lineHeight: 20,
  },
});
