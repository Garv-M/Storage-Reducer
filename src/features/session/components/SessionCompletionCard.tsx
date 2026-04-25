import { useEffect } from 'react';

import { Pressable, Text, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withDelay, withRepeat, withTiming } from 'react-native-reanimated';

import { bytesToHuman } from '@/utils/format';

interface SessionCompletionCardProps {
  reviewed: number;
  stagedForDeletion: number;
  bytesToFree: number;
  onReviewStaged: () => void;
  onGoHome: () => void;
}

export function SessionCompletionCard({
  reviewed,
  stagedForDeletion,
  bytesToFree,
  onReviewStaged,
  onGoHome,
}: SessionCompletionCardProps) {
  const sparkleA = useSharedValue(0);
  const sparkleB = useSharedValue(0);

  useEffect(() => {
    sparkleA.value = withRepeat(withTiming(1, { duration: 900 }), -1, true);
    sparkleB.value = withDelay(200, withRepeat(withTiming(1, { duration: 900 }), -1, true));
  }, [sparkleA, sparkleB]);

  const sparkleAStyle = useAnimatedStyle(() => ({
    opacity: sparkleA.value,
    transform: [{ translateY: -sparkleA.value * 10 }],
  }));

  const sparkleBStyle = useAnimatedStyle(() => ({
    opacity: sparkleB.value,
    transform: [{ translateY: -sparkleB.value * 8 }],
  }));

  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 20 }}>
      <View style={{ marginBottom: 8, flexDirection: 'row', gap: 8 }}>
        <Animated.Text style={[{ fontSize: 26 }, sparkleAStyle]}>✨</Animated.Text>
        <Animated.Text style={[{ fontSize: 28 }, sparkleBStyle]}>🎉</Animated.Text>
        <Animated.Text style={[{ fontSize: 26 }, sparkleAStyle]}>✨</Animated.Text>
      </View>

      <Text style={{ color: '#1b242d', fontSize: 30, fontWeight: '800' }}>All done! 🎉</Text>
      <Text style={{ color: '#2e3a46', marginTop: 8, textAlign: 'center' }}>
        Nice work—your cleanup session is complete.
      </Text>

      <View style={{ marginTop: 16, width: '100%', borderRadius: 12, borderWidth: 1, borderColor: '#d7dde4', padding: 14, gap: 6 }}>
        <Text style={{ color: '#2e3a46' }}>{`Reviewed: ${reviewed}`}</Text>
        <Text style={{ color: '#2e3a46' }}>{`Staged for deletion: ${stagedForDeletion}`}</Text>
        <Text style={{ color: '#2e3a46' }}>{`Potential storage to free: ${bytesToHuman(bytesToFree)}`}</Text>
      </View>

      <Pressable
        onPress={onReviewStaged}
        accessibilityRole="button"
        accessibilityLabel="Review staged photos"
        style={{ marginTop: 16, width: '100%', borderRadius: 12, backgroundColor: '#0053e2', paddingVertical: 12, alignItems: 'center' }}
      >
        <Text style={{ color: '#fff', fontWeight: '700' }}>Review Staged</Text>
      </Pressable>

      <Pressable
        onPress={onGoHome}
        accessibilityRole="button"
        accessibilityLabel="Go home"
        style={{ marginTop: 10, width: '100%', borderRadius: 12, borderWidth: 1, borderColor: '#d7dde4', paddingVertical: 12, alignItems: 'center' }}
      >
        <Text style={{ color: '#2e3a46', fontWeight: '700' }}>Go Home</Text>
      </Pressable>
    </View>
  );
}
