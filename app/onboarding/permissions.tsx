// Onboarding permissions screen for photo library access.
// Explains scope before requesting OS permission to improve consent quality.

import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Alert, SafeAreaView, StyleSheet, View } from 'react-native';

import { PHOTO_PERMISSION_MESSAGE } from '@/constants/permissions';
import { useMediaPermissions } from '@/features/swipe/hooks/useMediaPermissions';
import { useSettingsStore } from '@/stores/settingsStore';
import { Button } from '@/ui/primitives/Button';
import { Text } from '@/ui/primitives/Text';
import { colors } from '@/ui/theme/colors';

// ── Feature bullets ───────────────────────────────────────────────────────────
const BULLETS = [
  'Browse and swipe through your photo library',
  'View photo metadata — size, date, and albums',
  'Stage photos for deletion — nothing removed automatically',
] as const;

// ── Component ─────────────────────────────────────────────────────────────────
/**
 * Permission request screen shown during onboarding.
 */
export default function PermissionsScreen() {
  const router = useRouter();
  const setOnboarded = useSettingsStore((state) => state.setOnboarded);
  const { isRequesting, request } = useMediaPermissions();

  /**
   * Requests library access and advances onboarding only when granted.
   */
  const onAllow = async () => {
    const result = await request();

    if (result.granted) {
      setOnboarded(true);
      // Replace prevents returning to onboarding screens after successful completion.
      router.replace('/(tabs)/home');
      return;
    }

    Alert.alert(PHOTO_PERMISSION_MESSAGE.title, PHOTO_PERMISSION_MESSAGE.deniedHelp);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* ── Icon ── */}
        <View style={styles.iconRow}>
          <Ionicons name="images" size={72} color={colors.blue100} />
        </View>

        {/* ── Title & body ── */}
        <Text variant="title" style={styles.title}>
          {PHOTO_PERMISSION_MESSAGE.title}
        </Text>
        <Text variant="body" color={colors.light.textSecondary} style={styles.body}>
          {PHOTO_PERMISSION_MESSAGE.body}
        </Text>

        {/* ── Feature bullet list ── */}
        <View style={styles.bullets}>
          {BULLETS.map((text) => (
            <View key={text} style={styles.bulletRow}>
              <Ionicons name="checkmark-circle" size={20} color={colors.green100} />
              <Text variant="body" color={colors.gray160} style={styles.bulletText}>
                {text}
              </Text>
            </View>
          ))}
        </View>

        {/* ── CTAs ── */}
        <View style={styles.ctas}>
          <Button
            label={PHOTO_PERMISSION_MESSAGE.ctaAllow}
            variant="primary"
            size="lg"
            fullWidth
            loading={isRequesting}
            disabled={isRequesting}
            onPress={onAllow}
            accessibilityLabel="Allow photo library access"
          />
          <Button
            label="Skip for now"
            variant="ghost"
            size="md"
            fullWidth
            disabled
            // Intentionally disabled until a limited-read mode exists.
            onPress={() => {}}
            accessibilityLabel="Skip permissions for now — limited functionality"
          />
        </View>
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
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 48,
    paddingBottom: 32,
    alignItems: 'center',
  },
  iconRow: {
    marginBottom: 32,
  },
  title: {
    textAlign: 'center',
    marginBottom: 12,
  },
  body: {
    textAlign: 'center',
    maxWidth: 300,
    marginBottom: 40,
  },
  bullets: {
    width: '100%',
    gap: 16,
    marginBottom: 48,
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  bulletText: {
    flex: 1,
  },
  ctas: {
    width: '100%',
    gap: 8,
    marginTop: 'auto',
  },
});
