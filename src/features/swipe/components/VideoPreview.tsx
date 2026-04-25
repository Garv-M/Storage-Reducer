import { useEffect, useState } from 'react';

import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useVideoPlayer, VideoView } from 'expo-video';
import { Pressable, View } from 'react-native';

interface VideoPreviewProps {
  uri: string;
}

export function VideoPreview({ uri }: VideoPreviewProps) {
  const [isPlaying, setIsPlaying] = useState(false);

  const player = useVideoPlayer({ uri }, (instance) => {
    instance.loop = false;
    instance.pause();
  });

  useEffect(() => {
    return () => {
      player.pause();
    };
  }, [player]);

  return (
    <Pressable
      style={{ flex: 1, backgroundColor: '#000' }}
      onPress={() => {
        if (isPlaying) {
          player.pause();
          setIsPlaying(false);
          return;
        }

        player.play();
        setIsPlaying(true);
      }}
    >
      {isPlaying ? (
        <VideoView player={player} style={{ width: '100%', height: '100%' }} nativeControls />
      ) : (
        <>
          <Image source={{ uri }} style={{ width: '100%', height: '100%' }} contentFit="contain" />
          <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, alignItems: 'center', justifyContent: 'center' }}>
            <View style={{ width: 72, height: 72, borderRadius: 999, backgroundColor: '#00000099', alignItems: 'center', justifyContent: 'center' }}>
              <Ionicons name="play" size={34} color="#fff" style={{ marginLeft: 5 }} />
            </View>
          </View>
        </>
      )}
    </Pressable>
  );
}
