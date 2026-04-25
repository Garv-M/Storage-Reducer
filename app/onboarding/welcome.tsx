import { useRouter } from 'expo-router';
import { Pressable, Text, View } from 'react-native';

import { ScreenErrorBoundary } from '@/components/ScreenErrorBoundary';

const highlights = [
  { icon: '👆', title: 'Swipe to decide', detail: 'Quickly keep, skip, favorite, or stage delete.' },
  { icon: '🛡️', title: 'Safe deletion', detail: 'Everything is staged first so you can review before delete.' },
  { icon: '📈', title: 'Track progress', detail: 'Watch your storage wins and streaks grow over time.' },
];

export default function WelcomeScreen() {
  const router = useRouter();

  return (
    <ScreenErrorBoundary title="Welcome screen unavailable" onRetry={() => router.replace('/onboarding/welcome')}>
      <View className="flex-1 justify-between bg-white px-6 pb-10 pt-16">
      <View>
        <Text style={{ fontSize: 36, fontWeight: '800', color: '#0053e2', letterSpacing: 0.3 }}>SwipeClean</Text>
        <Text style={{ marginTop: 10, color: '#2e3a46', fontSize: 16 }}>
          Clean up your camera roll in minutes—confidently and safely.
        </Text>

        <View style={{ marginTop: 28, gap: 12 }}>
          {highlights.map((item) => (
            <View
              key={item.title}
              style={{ borderRadius: 14, borderWidth: 1, borderColor: '#d7dde4', padding: 14, backgroundColor: '#ffffff' }}
            >
              <Text style={{ fontSize: 20 }}>{item.icon}</Text>
              <Text style={{ marginTop: 6, color: '#1b242d', fontWeight: '700' }}>{item.title}</Text>
              <Text style={{ marginTop: 4, color: '#2e3a46' }}>{item.detail}</Text>
            </View>
          ))}
        </View>
      </View>

      <Pressable
        onPress={() => router.push('/onboarding/permissions')}
        accessibilityRole="button"
        accessibilityLabel="Get started"
        accessibilityHint="Begins onboarding and asks for photo permissions"
        style={{ marginTop: 24, backgroundColor: '#0053e2', paddingVertical: 16, borderRadius: 12, alignItems: 'center' }}
      >
        <Text style={{ color: '#fff', fontWeight: '700', fontSize: 16 }}>Get Started</Text>
      </Pressable>
      </View>
    </ScreenErrorBoundary>
  );
}
