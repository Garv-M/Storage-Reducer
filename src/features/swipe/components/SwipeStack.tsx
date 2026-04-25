import { useEffect, useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { SwipeCard } from '@/features/swipe/components/SwipeCard';
import { usePrefetchNext } from '@/features/swipe/hooks/usePrefetchNext';
import type { Asset } from '@/types/asset';
import type { Decision } from '@/types/decision';

interface SwipeStackProps {
  assets: Asset[];
  onSwipeComplete: (decision: Decision, asset: Asset) => void;
  onIndexChange?: (index: number) => void;
}

export function SwipeStack({ assets, onSwipeComplete, onIndexChange }: SwipeStackProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (currentIndex >= assets.length) {
      setCurrentIndex(Math.max(assets.length - 1, 0));
    }
  }, [assets.length, currentIndex]);

  usePrefetchNext(assets, currentIndex);

  const visibleCards = useMemo(() => assets.slice(currentIndex, currentIndex + 3), [assets, currentIndex]);

  const advance = () => {
    const next = currentIndex + 1;
    setCurrentIndex(next);
    onIndexChange?.(next);
  };

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

          return (
            <View
              key={asset.id}
              style={[
                styles.layer,
                { zIndex: 10 - index, top: depthOffset, left: depthOffset / 2, right: depthOffset / 2 },
              ]}
              pointerEvents={isTopCard ? 'auto' : 'none'}
            >
              <SwipeCard
                asset={asset}
                onSwipeComplete={(decision, swipedAsset) => {
                  onSwipeComplete(decision, swipedAsset);
                  if (isTopCard) {
                    advance();
                  }
                }}
              />
            </View>
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
