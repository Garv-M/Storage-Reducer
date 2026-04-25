import { useState } from 'react';

import { Image } from 'expo-image';
import { Dimensions, ScrollView, View } from 'react-native';

interface BurstAsset {
  id: string;
  uri: string;
}

interface BurstGroupPreviewProps {
  assets: BurstAsset[];
}

const { width } = Dimensions.get('window');

export function BurstGroupPreview({ assets }: BurstGroupPreviewProps) {
  const [index, setIndex] = useState(0);

  return (
    <View style={{ flex: 1 }}>
      <ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={(event) => {
          const next = Math.round(event.nativeEvent.contentOffset.x / width);
          setIndex(next);
        }}
      >
        {assets.map((asset) => (
          <View key={asset.id} style={{ width }}>
            <Image source={{ uri: asset.uri }} style={{ width: '100%', height: '100%' }} contentFit="contain" />
          </View>
        ))}
      </ScrollView>

      <View style={{ position: 'absolute', bottom: 14, alignSelf: 'center', flexDirection: 'row', gap: 6 }}>
        {assets.map((asset, dotIndex) => (
          <View
            key={asset.id}
            style={{
              width: 8,
              height: 8,
              borderRadius: 999,
              backgroundColor: dotIndex === index ? '#0053e2' : '#d7dde4',
            }}
          />
        ))}
      </View>
    </View>
  );
}
