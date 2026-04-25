import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { Image } from 'expo-image';

interface ZoomablePhotoProps {
  uri: string;
}

const AnimatedImage = Animated.createAnimatedComponent(Image);

export function ZoomablePhoto({ uri }: ZoomablePhotoProps) {
  const scale = useSharedValue(1);

  const pinch = Gesture.Pinch()
    .onUpdate((event) => {
      scale.value = event.scale;
    })
    .onEnd(() => {
      if (scale.value < 1) {
        scale.value = withTiming(1);
      }
    });

  const doubleTap = Gesture.Tap()
    .numberOfTaps(2)
    .onEnd(() => {
      scale.value = withTiming(scale.value > 1 ? 1 : 2);
    });

  const style = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <GestureDetector gesture={Gesture.Simultaneous(pinch, doubleTap)}>
      <AnimatedImage source={{ uri }} style={[{ width: '100%', height: '100%' }, style]} contentFit="contain" />
    </GestureDetector>
  );
}
