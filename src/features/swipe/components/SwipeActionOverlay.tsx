import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  Extrapolation,
  SharedValue,
  interpolate,
  useAnimatedStyle,
} from 'react-native-reanimated';

import { DECISION_COLORS } from '@/features/swipe/logic/decisions';

interface SwipeActionOverlayProps {
  tx: SharedValue<number>;
  ty: SharedValue<number>;
  width: number;
  height: number;
}

export function SwipeActionOverlay({ tx, ty, width, height }: SwipeActionOverlayProps) {
  const leftStyle = useAnimatedStyle(() => ({
    opacity: interpolate(tx.value, [-width * 0.3, 0], [1, 0], Extrapolation.CLAMP),
  }));
  const rightStyle = useAnimatedStyle(() => ({
    opacity: interpolate(tx.value, [0, width * 0.3], [0, 1], Extrapolation.CLAMP),
  }));
  const topStyle = useAnimatedStyle(() => ({
    opacity: interpolate(ty.value, [-height * 0.3, 0], [1, 0], Extrapolation.CLAMP),
  }));
  const bottomStyle = useAnimatedStyle(() => ({
    opacity: interpolate(ty.value, [0, height * 0.3], [0, 1], Extrapolation.CLAMP),
  }));

  return (
    <>
      <Animated.View style={[styles.badge, styles.left, { backgroundColor: DECISION_COLORS.DELETE_STAGED }, leftStyle]}>
        <Text style={styles.label}>DELETE</Text>
      </Animated.View>
      <Animated.View style={[styles.badge, styles.right, { backgroundColor: DECISION_COLORS.KEEP }, rightStyle]}>
        <Text style={styles.label}>KEEP</Text>
      </Animated.View>
      <Animated.View style={[styles.badge, styles.top, { backgroundColor: DECISION_COLORS.FAVORITE }, topStyle]}>
        <Text style={styles.label}>FAVORITE</Text>
      </Animated.View>
      <Animated.View style={[styles.badge, styles.bottom, { backgroundColor: DECISION_COLORS.SKIP_LATER }, bottomStyle]}>
        <Text style={styles.label}>SKIP</Text>
      </Animated.View>
    </>
  );
}

const styles = StyleSheet.create({
  badge: {
    position: 'absolute',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 999,
    zIndex: 40,
  },
  left: { left: 12, top: '45%' },
  right: { right: 12, top: '45%' },
  top: { top: 16, alignSelf: 'center' },
  bottom: { bottom: 16, alignSelf: 'center' },
  label: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 12,
  },
});
