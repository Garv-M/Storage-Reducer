import { useState } from 'react';

import { Image } from 'expo-image';
import { useVideoPlayer, VideoView } from 'expo-video';
import { Pressable, Text, View } from 'react-native';

interface LivePhotoPreviewProps {
  stillUri: string;
  motionUri?: string;
}

export function LivePhotoPreview({ stillUri, motionUri }: LivePhotoPreviewProps) {
  const [isHolding, setIsHolding] = useState(false);

  const player = useVideoPlayer(motionUri ? { uri: motionUri } : null, (instance) => {
    instance.loop = true;
  });

  return (
    <Pressable
      style={{ flex: 1, backgroundColor: '#f1f3f5' }}
      onPressIn={() => {
        if (!motionUri) return;
        setIsHolding(true);
        player.play();
      }}
      onPressOut={() => {
        if (!motionUri) return;
        setIsHolding(false);
        player.pause();
      }}
    >
      <Image source={{ uri: stillUri }} style={{ width: '100%', height: '100%' }} contentFit="contain" />
      <View style={{ position: 'absolute', top: 12, left: 12, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4, backgroundColor: '#00000099' }}>
        <Text style={{ color: '#fff', fontWeight: '700' }}>LIVE</Text>
      </View>

      {motionUri && isHolding ? (
        <VideoView player={player} style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }} nativeControls={false} />
      ) : null}
    </Pressable>
  );
}
