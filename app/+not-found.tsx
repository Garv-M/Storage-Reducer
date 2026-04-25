import { useRouter } from 'expo-router';
import { Pressable, Text, View } from 'react-native';

export default function NotFoundScreen() {
  const router = useRouter();

  return (
    <View className="flex-1 items-center justify-center gap-3 bg-white px-6">
      <Text style={{ fontSize: 42 }}>🧭</Text>
      <Text style={{ color: '#1b242d', fontWeight: '700', fontSize: 24 }}>Page not found</Text>
      <Text style={{ color: '#2e3a46', textAlign: 'center' }}>
        Looks like this screen moved. Let’s get you back to SwipeClean.
      </Text>
      <Pressable
        onPress={() => router.replace('/(tabs)/home')}
        accessibilityRole="button"
        accessibilityLabel="Go home"
        style={{ marginTop: 10, backgroundColor: '#0053e2', borderRadius: 10, paddingHorizontal: 18, paddingVertical: 10 }}
      >
        <Text style={{ color: '#fff', fontWeight: '700' }}>Go Home</Text>
      </Pressable>
    </View>
  );
}
