import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useMemo } from 'react';
import { Pressable, SafeAreaView, ScrollView, StyleSheet, View } from 'react-native';

import { StatsDashboard } from '@/features/stats/components/StatsDashboard';
import { useSessionStore } from '@/stores/sessionStore';
import { useSettingsStore } from '@/stores/settingsStore';
import { useStatsStore } from '@/stores/statsStore';
import { useTrashStore } from '@/stores/trashStore';
import { Button } from '@/ui/primitives/Button';
import { Card } from '@/ui/primitives/Card';
import { Text } from '@/ui/primitives/Text';
import { colors } from '@/ui/theme/colors';

// ── Component ─────────────────────────────────────────────────────────────────
export default function HomeTabScreen() {
  const router = useRouter();

  const createSession = useSessionStore((state) => state.createSession);
  const findResumable = useSessionStore((state) => state.findResumable);
  const setActiveSession = useSessionStore((state) => state.setActiveSession);

  const incognito = useSettingsStore((state) => state.incognito);
  const photosReviewed = useStatsStore((state) => state.photosReviewed);
  const confirmedTrash = useTrashStore((state) => state.confirmed);

  const resumable = useMemo(() => findResumable(), [findResumable, photosReviewed]);

  const startReview = () => {
    const session = createSession({ incognito });
    router.push(`/session/${session.id}`);
  };

  const resume = () => {
    if (!resumable) return;
    setActiveSession(resumable.id);
    router.push(`/session/${resumable.id}`);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Header ── */}
        <View style={styles.header}>
          <Text variant="hero" color={colors.blue100}>
            SwipeClean
          </Text>
          <Ionicons name="sparkles" size={24} color={colors.spark100} />
        </View>

        {/* ── Resume session card ── */}
        {resumable ? (
          <View style={styles.section}>
            <Pressable
              onPress={resume}
              accessibilityRole="button"
              accessibilityLabel="Resume previous session"
            >
              <Card variant="elevated" padding={16} style={styles.resumeCard}>
                <View style={styles.resumeInner}>
                  <Ionicons name="play-circle" size={48} color={colors.blue100} />
                  <View style={styles.resumeText}>
                    <Text variant="heading" color={colors.gray180}>
                      Resume Session
                    </Text>
                    <Text variant="caption" color={colors.light.textSecondary}>
                      {`Started ${new Date(resumable.createdAt).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}`}
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color={colors.gray100} />
                </View>
              </Card>
            </Pressable>
          </View>
        ) : null}

        {/* ── Stats ── */}
        <View style={styles.section}>
          <StatsDashboard />
        </View>

        {/* ── Trash warning ── */}
        {confirmedTrash.length > 0 ? (
          <View style={styles.section}>
            <Card
              variant="outlined"
              padding={16}
              style={styles.trashCard}
              accessibilityLabel={`${confirmedTrash.length} photos in trash`}
            >
              <View style={styles.trashRow}>
                <Ionicons name="warning" size={24} color={colors.spark100} />
                <View style={styles.trashText}>
                  <Text variant="heading" color={colors.spark140}>
                    {`${confirmedTrash.length} photos in trash`}
                  </Text>
                  <Text variant="caption" color={colors.spark140}>
                    Some items expiring soon — open Trash to manage.
                  </Text>
                </View>
              </View>
            </Card>
          </View>
        ) : null}

        {/* ── CTA ── */}
        <View style={styles.section}>
          <Button
            label="Start New Review"
            variant="primary"
            size="lg"
            fullWidth
            onPress={startReview}
            icon={<Ionicons name="camera" size={20} color={colors.white} />}
            accessibilityLabel="Start a new photo review session"
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.light.background,
  },
  scroll: {
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 32,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 48,
  },
  section: {
    marginBottom: 48,
  },
  resumeCard: {
    width: '100%',
  },
  resumeInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  resumeText: {
    flex: 1,
    gap: 4,
  },
  trashCard: {
    backgroundColor: colors.spark10,
    borderColor: colors.spark140,
    borderWidth: 1,
  },
  trashRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  trashText: {
    flex: 1,
    gap: 4,
  },
});
