// Card-stack container that controls z-order, depth illusion, and completion flow.
// Owns top-card interaction boundaries and loading/empty presentation states.

import { Ionicons } from '@expo/vector-icons';
import { useEffect, useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  SharedValue,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { SwipeCard } from '@/features/swipe/components/SwipeCard';
import { usePrefetchNext } from '@/features/swipe/hooks/usePrefetchNext';
import { Card } from '@/ui/primitives/Card';
import { Text } from '@/ui/primitives/Text';
import { colors } from '@/ui/theme/colors';
import type { Asset } from '@/types/asset';
import type { Decision } from '@/types/decision';

// ── Constants ─────────────────────────────────────────────────────────────────
const CARD_SCALES = [1, 0.95, 0.90] as const;
const CARD_OFFSETS = [0, 10, 20] as const; // depth offsets that create the deck illusion
const CARD_OPACITIES = [1, 0.70, 0.40] as const;
const SPRING = { damping: 18, stiffness: 170 };

// ── Loading skeleton ──────────────────────────────────────────────────────────
/**
 * Placeholder card shown while initial media data is loading.
 * Shimmer pulse loops 0.4 → 1.0 → 0.4 until real assets are ready.
 */
function ShimmerCard() {
  const shimmer = useSharedValue(0.4);

  useEffect(() => {
    shimmer.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 900 }),
        withTiming(0.4, { duration: 900 })
      ),
      -1,
      false
    );
    return () => {
      shimmer.value = 0.4;
    };
  }, [shimmer]);

  const shimmerStyle = useAnimatedStyle(() => ({ opacity: shimmer.value }));

  return (
    <Animated.View style={[styles.shimmerCard, shimmerStyle]}>
      <View style={styles.shimmerTop} />
      <View style={styles.shimmerBar} />
      <View style={[styles.shimmerBar, styles.shimmerBarShort]} />
    </Animated.View>
  );
}

// ── Types ─────────────────────────────────────────────────────────────────────
interface SwipeStackProps {
  assets: Asset[];
  onSwipeComplete: (decision: Decision, asset: Asset) => void;
  onIndexChange?: (index: number) => void;
  isLoading?: boolean;
  onComplete?: () => void;
}

interface BackgroundCardProps {
  asset: Asset;
  depth: 1 | 2;
  triggerScale: SharedValue<number>;
}

// ── Background layer ──────────────────────────────────────────────────────────
/**
 * Non-interactive card layer behind the top card.
 * Animates forward when the top card is dismissed to reinforce stack continuity.
 */
function BackgroundCard({ asset: _asset, depth, triggerScale }: BackgroundCardProps) {
  const targetScale = CARD_SCALES[depth];
  const yOffset = CARD_OFFSETS[depth];
  const targetOpacity = CARD_OPACITIES[depth];

  const cardStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: targetScale + (triggerScale.value * (1 - targetScale)) },
      { translateY: yOffset * (1 - triggerScale.value) },
    ],
    opacity: targetOpacity + (triggerScale.value * (1 - targetOpacity)),
  }));

  return (
    <Animated.View
      style={[StyleSheet.absoluteFill, cardStyle]}
      pointerEvents="none"
    >
      <View style={styles.bgCard} />
    </Animated.View>
  );
}

// ── Component ─────────────────────────────────────────────────────────────────
/**
 * Swipe stack rendering up to three cards with depth and transition motion.
 */
export function SwipeStack({ assets, onSwipeComplete, onIndexChange, isLoading = false, onComplete }: SwipeStackProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const transitionProgress = useSharedValue(0);

  useEffect(() => {
    // Each advance triggers a spring-forward cue on background cards.
    transitionProgress.value = 1;
    transitionProgress.value = withSpring(0, SPRING);
  }, [currentIndex, transitionProgress]);

  useEffect(() => {
    if (currentIndex >= assets.length && assets.length > 0) {
      setCurrentIndex(Math.max(assets.length - 1, 0));
    }
  }, [assets.length, currentIndex]);

  usePrefetchNext(assets, currentIndex);

  const visibleCards = useMemo(() => assets.slice(currentIndex, currentIndex + 3), [assets, currentIndex]);

  /**
   * Moves stack to the next item and emits index/completion signals.
   */
  const advance = () => {
    const next = currentIndex + 1;
    setCurrentIndex(next);
    onIndexChange?.(next);
    if (next >= assets.length) {
      onComplete?.();
    }
  };

  if (isLoading && assets.length === 0) {
    return (
      <View style={styles.container}>
        <ShimmerCard />
      </View>
    );
  }

  if (!isLoading && assets.length === 0) {
    return (
      <View style={styles.empty}>
        <Card variant="filled" padding={32} style={styles.emptyCard}>
          <View style={styles.emptyInner}>
            <Ionicons
              name="images-outline"
              size={64}
              color={colors.gray100}
              accessibilityElementsHidden
            />
            <Text variant="heading" style={styles.emptyHeading}>All caught up!</Text>
            <Text variant="body" color={colors.gray100} style={styles.emptySubtitle}>
              No photos found for this session. Start a new session to continue cleaning up.
            </Text>
          </View>
        </Card>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {visibleCards
        .map((asset, index) => ({ asset, index }))
        // Reverse render order so logical index 0 (top card) is drawn last and sits above others.
        .reverse()
        .map(({ asset, index }) => {
          const isTopCard = index === 0;

          if (isTopCard) {
            return (
              <View
                key={asset.id}
                style={[styles.layer, { zIndex: 10 }]}
                // Only top card should receive touch/gesture events.
                pointerEvents="auto"
              >
                <SwipeCard
                  asset={asset}
                  onSwipeComplete={(decision, swipedAsset) => {
                    onSwipeComplete(decision, swipedAsset);
                    advance();
                  }}
                />
              </View>
            );
          }

          return (
            <BackgroundCard
              key={asset.id}
              asset={asset}
              depth={index as 1 | 2}
              triggerScale={transitionProgress}
            />
          );
        })}
    </View>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
  },
  layer: {
    ...StyleSheet.absoluteFillObject,
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  emptyCard: {
    width: '100%',
    alignItems: 'center',
  },
  emptyInner: {
    alignItems: 'center',
    gap: 12,
  },
  emptyHeading: {
    marginTop: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    textAlign: 'center',
    maxWidth: 280,
  },
  bgCard: {
    flex: 1,
    borderRadius: 20,
    backgroundColor: colors.gray10,
    borderWidth: 1,
    borderColor: colors.gray50,
  },
  shimmerCard: {
    flex: 1,
    borderRadius: 20,
    backgroundColor: colors.gray10,
    borderWidth: 1,
    borderColor: colors.gray50,
    overflow: 'hidden',
    padding: 20,
    justifyContent: 'flex-end',
  },
  shimmerTop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.gray50,
    borderRadius: 20,
  },
  shimmerBar: {
    height: 16,
    borderRadius: 8,
    backgroundColor: colors.gray10,
    marginBottom: 8,
    width: '70%',
  },
  shimmerBarShort: {
    width: '45%',
  },
});
