import { useLocalSearchParams } from 'expo-router';
import { Text, View } from 'react-native';

export default function SessionByIdScreen() {
  const { sessionId } = useLocalSearchParams<{ sessionId: string }>();

  return (
    <View className="flex-1 items-center justify-center bg-white">
      <Text>{`Session ${sessionId ?? ''}`}</Text>
    </View>
  );
}
