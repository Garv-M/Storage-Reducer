import { type ReactNode, useEffect, useMemo, useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

import { SwipeCard } from '@/features/swipe/components/SwipeCard';
import { usePrefetchNext } from '@/features/swipe/hooks/usePrefetchNext';
import type { Asset } from '@/types/asset';
import type { Decision } from '@/types/decision';

interface SwipeStackProps {
  assets: Asset[];
  onSwipeComplete: (decision: Decision, asset: Asset) => void;
  onIndexChange?: (index: number, total: number) => void;
  manualDecision?: { id: number; decision: Decision } | null;
}

function StackLayer({
  children,
  scale,
  layerStyle,
  pointerEvents,
}: {
  children: ReactNode;
  scale: number;
  layerStyle: Record<string, number>;
  pointerEvents: 'auto' | 'none';
}) {
  const scaleValue = useSharedValue(scale);

  useEffect(() => {
    scaleValue.value = withTiming(scale, { duration: 220 });
  }, [scale, scaleValue]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scaleValue.value }],
  }));

  return (
    <Animated.View style={[styles.layer, layerStyle, animatedStyle]} pointerEvents={pointerEvents}>
      {children}
    </Animated.View>
  );
}

export function SwipeStack({ assets, onSwipeComplete, onIndexChange, manualDecision }: SwipeStackProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const lastManualDecisionId = useRef<number | null>(null);

  const groupedQueue = useMemo(() => {
    const seen = new Set<string>();

    return assets.filter((asset) => {
      if (!asset.groupId || asset.kind !== 'burst') return true;
      if (seen.has(asset.groupId)) return false;
      seen.add(asset.groupId);
      return true;
    });
  }, [assets]);

  useEffect(() => {
    if (currentIndex >= groupedQueue.length) {
      setCurrentIndex(Math.max(groupedQueue.length - 1, 0));
    }
  }, [groupedQueue.length, currentIndex]);

  usePrefetchNext(groupedQueue, currentIndex);

  const visibleCards = useMemo(() => groupedQueue.slice(currentIndex, currentIndex + 3), [groupedQueue, currentIndex]);

  const processDecision = (decision: Decision, swipedAsset: Asset, groupAssets: Asset[], shouldAdvance: boolean) => {
    if (swipedAsset.kind === 'burst' && groupAssets.length > 1) {
      groupAssets.forEach((member) => onSwipeComplete(decision, member));
    } else {
      onSwipeComplete(decision, swipedAsset);
    }

    if (shouldAdvance) {
      const next = currentIndex + 1;
      setCurrentIndex(next);
      onIndexChange?.(next, groupedQueue.length);
    }
  };

  useEffect(() => {
    onIndexChange?.(currentIndex, groupedQueue.length);
  }, [currentIndex, groupedQueue.length, onIndexChange]);

  useEffect(() => {
    if (!manualDecision || manualDecision.id === lastManualDecisionId.current) return;
    const topAsset = groupedQueue[currentIndex];
    if (!topAsset) return;

    lastManualDecisionId.current = manualDecision.id;
    const topGroupAssets = topAsset.groupId ? assets.filter((item) => item.groupId === topAsset.groupId) : [topAsset];
    processDecision(manualDecision.decision, topAsset, topGroupAssets, true);
  }, [assets, currentIndex, groupedQueue, manualDecision]);

  if (!visibleCards.length) {
    return (
      <View style={styles.empty}>
        <Text style={{ color: '#2e3a46' }}>No photos found for this session.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {visibleCards
        .map((asset, index) => ({ asset, index }))
        .reverse()
        .map(({ asset, index }) => {
          const depthOffset = index * 8;
          const isTopCard = index === 0;
          const groupAssets = asset.groupId ? assets.filter((item) => item.groupId === asset.groupId) : [asset];

          return (
            <StackLayer
              key={asset.id}
              layerStyle={{ zIndex: 10 - index, top: depthOffset, left: depthOffset / 2, right: depthOffset / 2 }}
              pointerEvents={isTopCard ? 'auto' : 'none'}
              scale={index === 0 ? 1 : index === 1 ? 0.94 : 0.9}
            >
              <SwipeCard
                asset={asset}
                groupAssets={groupAssets}
                onSwipeComplete={(decision, swipedAsset) => {
                  processDecision(decision, swipedAsset, groupAssets, isTopCard);
                }}
              />
            </StackLayer>
          );
        })}
    </View>
  );
}

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
  },
});
