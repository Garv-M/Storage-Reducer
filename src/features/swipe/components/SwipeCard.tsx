import { useMemo, useState } from 'react';
import { Dimensions, Pressable, StyleSheet, View } from 'react-native';
import { GestureDetector } from 'react-native-gesture-handler';
import Animated, { useAnimatedStyle } from 'react-native-reanimated';

import { ROTATION_FACTOR } from '@/constants/thresholds';
import { SwipeActionOverlay } from '@/features/swipe/components/SwipeActionOverlay';
import { BurstGroupPreview } from '@/features/swipe/components/BurstGroupPreview';
import { LivePhotoPreview } from '@/features/swipe/components/LivePhotoPreview';
import { MetadataSheet } from '@/features/swipe/components/MetadataSheet';
import { VideoPreview } from '@/features/swipe/components/VideoPreview';
import { ZoomablePhoto } from '@/features/swipe/components/ZoomablePhoto';
import { useSwipeGestures } from '@/features/swipe/hooks/useSwipeGestures';
import type { Asset } from '@/types/asset';
import type { Decision } from '@/types/decision';

interface SwipeCardProps {
  asset: Asset;
  groupAssets?: Asset[];
  onSwipeComplete: (decision: Decision, asset: Asset) => void;
}

const { width, height } = Dimensions.get('window');

export function SwipeCard({ asset, groupAssets = [], onSwipeComplete }: SwipeCardProps) {
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
          <Pressable
            style={{ flex: 1 }}
            onLongPress={() => setShowMetadata(true)}
            delayLongPress={250}
            accessibilityRole="imagebutton"
            accessibilityLabel={`Photo card ${asset.filename}`}
            accessibilityHint="Swipe left to delete, right to keep, up to favorite, or down to skip"
          >
            {asset.kind === 'burst' && groupAssets.length > 1 ? <BurstGroupPreview assets={groupAssets} /> : null}
            {asset.kind === 'livePhoto' ? <LivePhotoPreview stillUri={asset.uri} motionUri={asset.pairing?.motionUri} /> : null}
            {asset.kind === 'video' ? <VideoPreview uri={asset.uri} /> : null}
            {asset.kind === 'photo' || asset.kind === 'rawPair' ? <ZoomablePhoto uri={asset.uri} /> : null}
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
