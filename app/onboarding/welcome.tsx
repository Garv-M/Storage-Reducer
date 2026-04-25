import { useRouter } from 'expo-router';
import { Pressable, Text, View } from 'react-native';

export default function WelcomeScreen() {
  const router = useRouter();

  return (
    <View className="flex-1 justify-center bg-white px-6">
      <Text style={{ fontSize: 28, fontWeight: '700', color: '#2e3a46' }}>Welcome to Storage Reducer</Text>
      <Text style={{ marginTop: 12, color: '#2e3a46' }}>
        Swipe through your photos, stage deletions safely, and review before anything is removed.
      </Text>
      <Pressable
        onPress={() => router.push('/onboarding/permissions')}
        style={{ marginTop: 24, backgroundColor: '#0053e2', paddingVertical: 14, borderRadius: 12, alignItems: 'center' }}
      >
        <Text style={{ color: '#fff', fontWeight: '700' }}>Get Started</Text>
      </Pressable>
    </View>
  );
}
