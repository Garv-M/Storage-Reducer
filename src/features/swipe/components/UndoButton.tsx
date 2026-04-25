import { useEffect } from 'react';

import { Pressable, Text } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSequence, withSpring } from 'react-native-reanimated';

interface UndoButtonProps {
  disabled: boolean;
  onPress: () => void;
  successTick?: number;
}

export function UndoButton({ disabled, onPress, successTick = 0 }: UndoButtonProps) {
  const scale = useSharedValue(1);

  useEffect(() => {
    if (!successTick) return;
    scale.value = withSequence(withSpring(1.08, { damping: 10 }), withSpring(1, { damping: 10 }));
  }, [scale, successTick]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View style={[{ position: 'absolute', bottom: 24, right: 20 }, animatedStyle]}>
      <Pressable
        onPress={onPress}
        disabled={disabled}
        accessibilityRole="button"
        accessibilityLabel="Undo last action"
        accessibilityHint="Restores the most recent swipe decision"
        style={{
          backgroundColor: disabled ? '#a2afc0' : '#0053e2',
          paddingHorizontal: 16,
          paddingVertical: 12,
          borderRadius: 999,
        }}
      >
        <Text style={{ color: '#fff', fontWeight: '700' }}>Undo</Text>
      </Pressable>
    </Animated.View>
  );
}
