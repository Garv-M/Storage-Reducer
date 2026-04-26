// Fallback route for unknown URLs/screens.
// Gives users a safe way back to the main app shell.

import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { SafeAreaView, StyleSheet, View } from 'react-native';

import { Button } from '@/ui/primitives/Button';
import { Text } from '@/ui/primitives/Text';
import { colors } from '@/ui/theme/colors';

/**
 * 404-style not-found screen.
 */
export default function NotFoundScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.center}>
        <Ionicons name="search" size={64} color={colors.gray100} />
        <Text variant="title" color={colors.gray180} style={styles.title}>
          Page Not Found
        </Text>
        <Text variant="body" color={colors.light.textSecondary} style={styles.body}>
          The screen you're looking for doesn't exist.
        </Text>
        <Button
          label="Go Home"
          variant="primary"
          size="md"
          // Replace avoids returning to an invalid route with the back gesture.
          onPress={() => router.replace('/(tabs)/home')}
          accessibilityLabel="Go to home screen"
        />
      </View>
    </SafeAreaView>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.light.background,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    gap: 16,
  },
  title: {
    textAlign: 'center',
  },
  body: {
    textAlign: 'center',
    marginBottom: 8,
  },
});
