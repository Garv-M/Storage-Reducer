import { Link } from 'expo-router';
import { Text, View } from 'react-native';

export default function NotFoundScreen() {
  return (
    <View className="flex-1 items-center justify-center gap-3 bg-white">
      <Text>Screen not found.</Text>
      <Link href="/(tabs)/home">Go Home</Link>
    </View>
  );
}
