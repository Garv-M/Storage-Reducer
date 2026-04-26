// Gesture-enabled photo renderer for swipe cards.
// Supports pinch zoom and double-tap zoom while preserving contain-fit framing.

import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { Image } from 'expo-image';

interface ZoomablePhotoProps {
  uri: string;
}

const AnimatedImage = Animated.createAnimatedComponent(Image);

/**
 * Renders a zoomable image with simultaneous pinch and double-tap gestures.
 */
export function ZoomablePhoto({ uri }: ZoomablePhotoProps) {
  const scale = useSharedValue(1);

  const pinch = Gesture.Pinch()
    .onUpdate((event) => {
      // Directly mirror pinch scale for immediate tactile feedback.
      scale.value = event.scale;
    })
    .onEnd(() => {
      if (scale.value < 1) {
        // Prevent underscaled images from staying smaller than container bounds.
        scale.value = withTiming(1);
      }
    });

  const doubleTap = Gesture.Tap()
    .numberOfTaps(2)
    .onEnd(() => {
      // Toggle between baseline and quick-inspect zoom level.
      scale.value = withTiming(scale.value > 1 ? 1 : 2);
    });

  const style = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <GestureDetector gesture={Gesture.Simultaneous(pinch, doubleTap)}>
      {/* Simultaneous composition avoids tap-vs-pinch recognizer starvation. */}
      <AnimatedImage source={{ uri }} style={[{ width: '100%', height: '100%' }, style]} contentFit="contain" />
    </GestureDetector>
  );
}