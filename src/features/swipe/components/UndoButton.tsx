import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { IconButton } from '@/ui/primitives/IconButton';
import { colors } from '@/ui/theme/colors';

interface UndoButtonProps {
  disabled: boolean;
  onPress: () => void;
}

export function UndoButton({ disabled, onPress }: UndoButtonProps) {
  const pulseScale = useSharedValue(1);

  // Breathe / pulse animation when the button is active
  useEffect(() => {
    if (!disabled) {
      pulseScale.value = withRepeat(
        withSequence(
          withTiming(1.1, { duration: 800 }),
          withTiming(1.0, { duration: 800 })
        ),
        -1,
        false
      );
    } else {
      cancelAnimation(pulseScale);
      pulseScale.value = withTiming(1.0, { duration: 200 });
    }
    return () => {
      cancelAnimation(pulseScale);
    };
  }, [disabled, pulseScale]);

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
  }));

  return (
    <Animated.View style={[styles.container, pulseStyle]}>
      {/* Glow ring — only visible when enabled */}
      {!disabled && <View style={styles.glowRing} />}

      <IconButton
        icon="arrow-undo"
        onPress={onPress}
        size={52}
        variant={disabled ? 'secondary' : 'primary'}
        disabled={disabled}
        hapticStyle="medium"
        accessibilityLabel="Undo last swipe"
        accessibilityHint="Double tap to undo your most recent photo decision"
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    alignItems: 'center',
    justifyContent: 'center',
    // Floating shadow
    shadowColor: colors.gray180,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 10,
  },
  glowRing: {
    position: 'absolute',
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 2,
    borderColor: colors.blue100,
    opacity: 0.35,
  },
});
