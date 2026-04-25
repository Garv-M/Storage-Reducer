import { useMemo, useState } from 'react';
import { Dimensions, Pressable, StyleSheet, View } from 'react-native';
import { GestureDetector } from 'react-native-gesture-handler';
import Animated, { useAnimatedStyle } from 'react-native-reanimated';

import { ROTATION_FACTOR } from '@/constants/thresholds';
import { SwipeActionOverlay } from '@/features/swipe/components/SwipeActionOverlay';
import { ZoomablePhoto } from '@/features/swipe/components/ZoomablePhoto';
import { useSwipeGestures } from '@/features/swipe/hooks/useSwipeGestures';
import type { Decision } from '@/types/decision';
import type { Asset } from '@/types/asset';
import { MetadataSheet } from '@/features/swipe/components/MetadataSheet';

interface SwipeCardProps {
  asset: Asset;
  onSwipeComplete: (decision: Decision, asset: Asset) => void;
}

const { width, height } = Dimensions.get('window');

export function SwipeCard({ asset, onSwipeComplete }: SwipeCardProps) {
  const [showMetadata, setShowMetadata] = useState(false);
  const { pan, tx, ty } = useSwipeGestures({
    width,
    height,
    onSwipeComplete: (decision) => onSwipeComplete(decision, asset),
  });

  const cardStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: tx.value },
      { translateY: ty.value },
      { rotate: `${(tx.value / width) * ROTATION_FACTOR}deg` },
    ],
  }));

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
          <Pressable style={{ flex: 1 }} onLongPress={() => setShowMetadata(true)} delayLongPress={250}>
            <ZoomablePhoto uri={asset.uri} />
            <SwipeActionOverlay tx={tx} ty={ty} width={width} height={height} />
          </Pressable>
        </Animated.View>
      </GestureDetector>
      <MetadataSheet visible={showMetadata} onClose={() => setShowMetadata(false)} metadata={metadata} />
    </>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '100%',
    height: '100%',
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: '#f1f3f5',
  },
});
