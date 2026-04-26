import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';

import { useLocalSearchParams, useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ProgressHeader } from '@/features/swipe/components/ProgressHeader';
import { SwipeStack } from '@/features/swipe/components/SwipeStack';
import { UndoButton } from '@/features/swipe/components/UndoButton';
import { useSessionQueue } from '@/features/swipe/hooks/useSessionQueue';
import { useSessionStore } from '@/stores/sessionStore';
import { useStatsStore } from '@/stores/statsStore';
import { useTrashStore } from '@/stores/trashStore';
import { Button } from '@/ui/primitives/Button';
import { ProgressBar } from '@/ui/primitives/ProgressBar';
import { Text } from '@/ui/primitives/Text';
import { colors } from '@/ui/theme/colors';
import type { Asset } from '@/types/asset';
import type { Decision } from '@/types/decision';

export default function SessionByIdScreen() {
  const { sessionId } = useLocalSearchParams<{ sessionId: string }>();
  const router = useRouter();

  const [isComplete, setIsComplete] = useState(false);

  const session       = useSessionStore((state) => (sessionId ? state.sessions[sessionId] : undefined));
  const setActiveSession = useSessionStore((state) => state.setActiveSession);
  const recordDecision   = useSessionStore((state) => state.recordDecision);
  const undo             = useSessionStore((state) => state.undo);
  const completeSession  = useSessionStore((state) => state.completeSession);

  const addStaged    = useTrashStore((state) => state.addStaged);
  const removeStaged = useTrashStore((state) => state.removeStaged);

  const incrementReviewed  = useStatsStore((state) => state.incrementReviewed);
  const incrementFavorites = useStatsStore((state) => state.incrementFavorites);

  const { assets, isLoading } = useSessionQueue(sessionId ?? '');

  useEffect(() => {
    if (session?.id) {
      setActiveSession(session.id);
    }
  }, [session?.id, setActiveSession]);

  if (!sessionId || !session) {
    router.replace('/(tabs)/home');
    return null;
  }

  const onSwipeComplete = (decision: Decision, asset: Asset) => {
    const bytes = decision === 'DELETE_STAGED' ? asset.bytes : 0;
    recordDecision(asset.id, decision, bytes);
    incrementReviewed();
    if (decision === 'DELETE_STAGED') addStaged(asset);
    if (decision === 'FAVORITE') incrementFavorites();
  };

  const onUndo = () => {
    const undone = undo();
    if (!undone) return;
    if (undone.decision === 'DELETE_STAGED') removeStaged(undone.assetId);
  };

  const handleComplete = () => {
    completeSession(sessionId);
    setIsComplete(true);
  };

  const stagedCount   = session.decisions.filter((d) => d.decision === 'DELETE_STAGED').length;
  const keptCount     = session.decisions.filter((d) => d.decision === 'KEEP').length;
  const favCount      = session.decisions.filter((d) => d.decision === 'FAVORITE').length;
  const reviewedCount = session.decisions.length;

  return (
    <SafeAreaView style={styles.root} edges={['left', 'right', 'bottom']}>
      {/* Progress header manages its own top safe-area inset */}
      <ProgressHeader
        reviewed={reviewedCount}
        total={Math.max(session.queueIds.length, assets.length)}
        freedBytes={session.freedBytesEstimated}
      />

      {/* Loading state */}
      {isLoading && assets.length === 0 ? (
        <View style={styles.loadingState} accessibilityLiveRegion="polite">
          <ProgressBar progress={0.3} animated accessibilityLabel="Loading photos" />
          <Text variant="body" color={colors.gray100} style={styles.loadingText}>
            Loading photos…
          </Text>
        </View>
      ) : (
        <View style={styles.stackContainer}>
          <SwipeStack
            assets={assets}
            onSwipeComplete={onSwipeComplete}
            isLoading={isLoading}
            onComplete={handleComplete}
          />
        </View>
      )}

      {/* Undo button — floating */}
      {!isComplete && <UndoButton disabled={session.undoStack.length === 0} onPress={onUndo} />}

      {/* Completion overlay */}
      {isComplete && (
        <View style={styles.completionOverlay} accessibilityViewIsModal accessibilityLiveRegion="assertive">
          <View style={styles.completionCard}>
            <Ionicons
              name="checkmark-circle"
              size={72}
              color={colors.green100}
              accessibilityLabel="Session complete"
            />
            <Text variant="title" style={styles.completionTitle}>All Done!</Text>
            <Text variant="body" color={colors.gray100} style={styles.completionSubtitle}>
              You reviewed {reviewedCount} photo{reviewedCount !== 1 ? 's' : ''}.
            </Text>

            {/* Quick stats */}
            <View style={styles.statsRow}>
              <StatChip label="Staged" value={stagedCount} color={colors.red100} />
              <StatChip label="Kept"   value={keptCount}   color={colors.green100} />
              <StatChip label="Faves"  value={favCount}    color={colors.spark140} />
            </View>

            {/* CTAs */}
            <View style={styles.completionActions}>
              {stagedCount > 0 && (
                <Button
                  label="Review Staged"
                  variant="primary"
                  size="lg"
                  fullWidth
                  onPress={() => router.push('/session/review')}
                  accessibilityLabel="Review staged photos for deletion"
                />
              )}
              <View style={styles.actionSpacer} />
              <Button
                label="Go Home"
                variant="secondary"
                size="lg"
                fullWidth
                onPress={() => router.replace('/(tabs)/home')}
                accessibilityLabel="Return to home screen"
              />
            </View>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

// ── Stat chip helper ──────────────────────────────────────────────────────────
function StatChip({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <View style={chipStyles.chip} accessibilityRole="text" accessibilityLabel={`${label}: ${value}`}>
      <Text variant="heading" color={color}>{String(value)}</Text>
      <Text variant="label"   color={colors.gray100}>{label}</Text>
    </View>
  );
}

const chipStyles = StyleSheet.create({
  chip: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: colors.gray5,
    borderWidth: 1,
    borderColor: colors.gray50,
    gap: 2,
  },
});

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.light.background,
  },
  loadingState: {
    flex: 1,
    paddingHorizontal: 40,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    marginTop: 4,
  },
  stackContainer: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 100, // room for floating UndoButton
  },
  // ── Completion overlay ────────────────────────────────────────────────────
  completionOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.light.overlay,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    zIndex: 100,
  },
  completionCard: {
    width: '100%',
    backgroundColor: colors.white,
    borderRadius: 24,
    padding: 28,
    alignItems: 'center',
    shadowColor: colors.gray180,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 24,
    elevation: 12,
    gap: 12,
  },
  completionTitle: {
    textAlign: 'center',
  },
  completionSubtitle: {
    textAlign: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    width: '100%',
    gap: 8,
    marginTop: 4,
  },
  completionActions: {
    width: '100%',
    marginTop: 8,
  },
  actionSpacer: {
    height: 8,
  },
});
