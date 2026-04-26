// Interactive swipe card for a single asset.
// Combines gesture handling, directional feedback, and metadata access affordances.

import { useRef, useMemo, useState } from 'react';
import { Dimensions, Pressable, StyleSheet, View } from 'react-native';
import { GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { ROTATION_FACTOR } from '@/constants/thresholds';
import { SwipeActionOverlay } from '@/features/swipe/components/SwipeActionOverlay';
import { ZoomablePhoto } from '@/features/swipe/components/ZoomablePhoto';
import { useSwipeGestures } from '@/features/swipe/hooks/useSwipeGestures';
import { MetadataSheet } from '@/features/swipe/components/MetadataSheet';
import { colors } from '@/ui/theme/colors';
import type { Decision } from '@/types/decision';
import type { Asset } from '@/types/asset';

interface SwipeCardProps {
  asset: Asset;
  onSwipeComplete: (decision: Decision, asset: Asset) => void;
}

const { width, height } = Dimensions.get('window');

const SPRING_CONFIG = { damping: 18, stiffness: 170 };
const PRESS_SCALE = 0.98;

/**
 * Renders the top swipeable card and reports completed decisions.
 */
export function SwipeCard({ asset, onSwipeComplete }: SwipeCardProps) {
  const [showMetadata, setShowMetadata] = useState(false);
  const pressScale = useSharedValue(1);
  const glowOpacity = useSharedValue(0);
  const longPressTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { pan, tx, ty } = useSwipeGestures({
    width,
    height,
    onSwipeComplete: (decision) => onSwipeComplete(decision, asset),
  });

  // ── Animated styles ─────────────────────────────────────────────────────────
  const cardStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: tx.value },
      { translateY: ty.value },
      { rotate: `${(tx.value / width) * ROTATION_FACTOR}deg` },
      { scale: pressScale.value },
    ],
  }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
  }));

  // ── Press handlers (scale + glow) ──────────────────────────────────────────
  const handlePressIn = () => {
    pressScale.value = withSpring(PRESS_SCALE, SPRING_CONFIG);
    // Start pulse only after a short delay to hint long-press without distracting quick taps.
    longPressTimerRef.current = setTimeout(() => {
      glowOpacity.value = withRepeat(
        withSequence(
          withTiming(0.35, { duration: 350 }),
          withTiming(0.1, { duration: 350 })
        ),
        -1,
        false
      );
    }, 150);
  };

  const handlePressOut = () => {
    pressScale.value = withSpring(1, SPRING_CONFIG);
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
    cancelAnimation(glowOpacity);
    glowOpacity.value = withTiming(0, { duration: 150 });
  };

  const handleLongPress = () => {
    cancelAnimation(glowOpacity);
    glowOpacity.value = withTiming(0, { duration: 200 });
    setShowMetadata(true);
  };

  const metadata = useMemo(
    () => ({
      filename: asset.filename,
      createdAt: asset.createdAt,
      bytes: asset.bytes,
      albums: asset.albumIds,
    }),
    [asset]
  );

  return (
    <>
      <GestureDetector gesture={pan}>
        <Animated.View style={[styles.card, cardStyle]}>
          {/* Overflow clipping is isolated to photo layer so outer shadow still renders. */}
          <View style={styles.photoClip}>
            <Pressable
              style={StyleSheet.absoluteFill}
              onPressIn={handlePressIn}
              onPressOut={handlePressOut}
              onLongPress={handleLongPress}
              delayLongPress={400}
              accessibilityLabel={`Photo: ${asset.filename}`}
              accessibilityHint="Long press to view metadata, swipe to make a decision"
            >
              <ZoomablePhoto uri={asset.uri} />
              <SwipeActionOverlay tx={tx} ty={ty} width={width} height={height} />
            </Pressable>
          </View>

          {/* Glow sits outside clipped photo layer to preserve rounded-border emphasis. */}
          <Animated.View style={[StyleSheet.absoluteFill, styles.glowOverlay, glowStyle]} pointerEvents="none" />
        </Animated.View>
      </GestureDetector>

      <MetadataSheet visible={showMetadata} onClose={() => setShowMetadata(false)} metadata={metadata} />
    </>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  card: {
    width: '100%',
    height: '100%',
    borderRadius: 20,
    backgroundColor: colors.gray5,
    borderWidth: 1,
    borderColor: colors.gray50,
    shadowColor: colors.gray180,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 5,
  },
  photoClip: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 20,
    overflow: 'hidden',
  },
  glowOverlay: {
    borderRadius: 20,
    backgroundColor: colors.spark100,
    borderWidth: 2,
    borderColor: colors.spark100,
  },
});
