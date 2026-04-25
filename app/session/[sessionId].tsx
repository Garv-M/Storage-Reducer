import { useEffect, useMemo, useState } from 'react';

import * as Haptics from 'expo-haptics';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';

import { ScreenErrorBoundary } from '@/components/ScreenErrorBoundary';
import { SessionCompletionCard } from '@/features/session/components/SessionCompletionCard';
import { useHiddenAlbumGuard } from '@/features/lock/hooks/useHiddenAlbumGuard';
import { ProgressHeader } from '@/features/swipe/components/ProgressHeader';
import { SwipeStack } from '@/features/swipe/components/SwipeStack';
import { UndoButton } from '@/features/swipe/components/UndoButton';
import { useSessionQueue } from '@/features/swipe/hooks/useSessionQueue';
import { useShakeToUndo } from '@/features/swipe/hooks/useShakeToUndo';
import { getPermissions, requestPermissions } from '@/services/media/MediaLibrary';
import { useSessionStore } from '@/stores/sessionStore';
import { useStatsStore } from '@/stores/statsStore';
import { useTrashStore } from '@/stores/trashStore';
import type { Asset } from '@/types/asset';
import type { Decision } from '@/types/decision';

export default function SessionByIdScreen() {
  const { sessionId } = useLocalSearchParams<{ sessionId: string }>();
  const router = useRouter();

  const session = useSessionStore((state) => (sessionId ? state.sessions[sessionId] : undefined));
  const setActiveSession = useSessionStore((state) => state.setActiveSession);
  const recordDecision = useSessionStore((state) => state.recordDecision);
  const undo = useSessionStore((state) => state.undo);

  const addStaged = useTrashStore((state) => state.addStaged);
  const removeStaged = useTrashStore((state) => state.removeStaged);

  const incrementReviewed = useStatsStore((state) => state.incrementReviewed);
  const incrementFavorites = useStatsStore((state) => state.incrementFavorites);
  const updateStreak = useStatsStore((state) => state.updateStreak);

  const hiddenSource = useMemo(() => session?.filterId?.toLowerCase().includes('hidden') ?? false, [session?.filterId]);
  const { isAuthorized: hiddenAuthorized } = useHiddenAlbumGuard(hiddenSource);

  const { assets, isLoading, hasNextPage, skippedProtectedCount, clearSkippedProtectedCount } = useSessionQueue(
    sessionId ?? '',
    !hiddenSource || hiddenAuthorized
  );
  const [skipMessage, setSkipMessage] = useState<string | null>(null);
  const [manualDecision, setManualDecision] = useState<{ id: number; decision: Decision } | null>(null);
  const [undoSuccessTick, setUndoSuccessTick] = useState(0);
  const [manualDecisionId, setManualDecisionId] = useState(0);
  const [stackIndex, setStackIndex] = useState(0);
  const [stackTotal, setStackTotal] = useState(0);
  const [permissionGranted, setPermissionGranted] = useState(true);

  const isIncognito = useMemo(() => Boolean(session?.incognito), [session?.incognito]);

  useEffect(() => {
    if (session?.id) {
      setActiveSession(session.id);
    }
  }, [session?.id, setActiveSession]);

  useEffect(() => {
    void (async () => {
      const permission = await getPermissions();
      setPermissionGranted(permission.granted);
    })();
  }, []);

  const onSwipeComplete = (decision: Decision, asset: Asset) => {
    const bytes = decision === 'DELETE_STAGED' ? asset.bytes : 0;

    recordDecision(asset.id, decision, bytes);

    if (!isIncognito) {
      incrementReviewed(asset.createdAt);
      updateStreak();

      if (decision === 'FAVORITE') {
        incrementFavorites();
      }
    }

    if (decision === 'DELETE_STAGED') {
      addStaged(asset);
    }
  };

  const onUndo = () => {
    const undone = undo();
    if (!undone) return;

    setUndoSuccessTick((tick) => tick + 1);

    if (undone.decision === 'DELETE_STAGED') {
      removeStaged(undone.assetId);
    }
  };

  useShakeToUndo({
    enabled: Boolean(session?.id),
    onShake: onUndo,
  });

  useEffect(() => {
    if (!skippedProtectedCount) return;

    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    setSkipMessage(`Skipped ${skippedProtectedCount} protected photos`);
    clearSkippedProtectedCount();

    const timer = setTimeout(() => {
      setSkipMessage(null);
    }, 1800);

    return () => clearTimeout(timer);
  }, [clearSkippedProtectedCount, skippedProtectedCount]);

  if (!sessionId || !session) {
    router.replace('/(tabs)/home');
    return null;
  }

  if (hiddenSource && !hiddenAuthorized) {
    return (
      <View style={{ flex: 1, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" color="#0053e2" />
        <Text style={{ marginTop: 8, color: '#2e3a46' }}>Re-authenticating hidden album access…</Text>
      </View>
    );
  }

  const isQueueComplete = !isLoading && stackTotal > 0 && stackIndex >= stackTotal;
  const isEmptyQueue = !isLoading && assets.length === 0 && !hasNextPage;

  if (isQueueComplete) {
    const stagedForDeletion = session.decisions.filter((item) => item.decision === 'DELETE_STAGED').length;

    return (
      <ScreenErrorBoundary title="Session completion screen failed">
        <View style={{ flex: 1, backgroundColor: '#fff' }}>
          <SessionCompletionCard
            reviewed={session.decisions.length}
            stagedForDeletion={stagedForDeletion}
            bytesToFree={session.freedBytesEstimated}
            onReviewStaged={() => router.push('/session/review')}
            onGoHome={() => router.replace('/(tabs)/home')}
          />
        </View>
      </ScreenErrorBoundary>
    );
  }

  if (isEmptyQueue) {
    return (
      <ScreenErrorBoundary title="Session unavailable">
        <View style={{ flex: 1, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24 }}>
          <Text style={{ fontSize: 28 }}>🗂️</Text>
          <Text style={{ marginTop: 8, color: '#1b242d', fontSize: 20, fontWeight: '700' }}>No photos queued</Text>
          <Text style={{ marginTop: 6, color: '#2e3a46', textAlign: 'center' }}>
            {permissionGranted
              ? 'There are no photos available for this review right now.'
              : 'Photo permission is required to start a review session.'}
          </Text>

          {!permissionGranted ? (
            <Pressable
              onPress={async () => {
                const permission = await requestPermissions();
                setPermissionGranted(permission.granted);
              }}
              accessibilityRole="button"
              accessibilityLabel="Request photo permission"
              style={{ marginTop: 14, borderRadius: 12, backgroundColor: '#0053e2', paddingHorizontal: 14, paddingVertical: 10 }}
            >
              <Text style={{ color: '#fff', fontWeight: '700' }}>Allow Access</Text>
            </Pressable>
          ) : null}

          <Pressable
            onPress={() => router.replace('/(tabs)/home')}
            accessibilityRole="button"
            accessibilityLabel="Go home"
            style={{ marginTop: 10, borderRadius: 12, borderWidth: 1, borderColor: '#d7dde4', paddingHorizontal: 14, paddingVertical: 10 }}
          >
            <Text style={{ color: '#2e3a46', fontWeight: '700' }}>Go Home</Text>
          </Pressable>
        </View>
      </ScreenErrorBoundary>
    );
  }

  return (
    <ScreenErrorBoundary title="Session screen failed">
      <View style={{ flex: 1, backgroundColor: '#fff', paddingTop: 50 }}>
      <ProgressHeader
        reviewed={session.decisions.length}
        total={Math.max(session.queueIds.length, assets.length)}
        freedBytes={session.freedBytesEstimated}
      />

      {isIncognito ? (
        <View style={{ marginHorizontal: 16, marginBottom: 10, alignSelf: 'flex-start', borderRadius: 999, backgroundColor: '#1b242d', paddingHorizontal: 10, paddingVertical: 4 }}>
          <Text style={{ color: '#fff', fontWeight: '700' }}>Incognito</Text>
        </View>
      ) : null}

      {skipMessage ? (
        <View style={{ marginHorizontal: 16, marginBottom: 10, borderRadius: 10, backgroundColor: '#fff8e1', borderWidth: 1, borderColor: '#ffc220', padding: 8 }}>
          <Text style={{ color: '#995213', fontWeight: '600' }}>{skipMessage}</Text>
        </View>
      ) : null}

      <View style={{ flex: 1, padding: 12 }}>
        {isLoading && assets.length === 0 ? <ActivityIndicator size="large" color="#0053e2" /> : null}
        <SwipeStack
          assets={assets}
          onSwipeComplete={onSwipeComplete}
          manualDecision={manualDecision}
          onIndexChange={(index, total) => {
            setStackIndex(index);
            setStackTotal(total);
          }}
        />
      </View>

      <View style={{ paddingHorizontal: 12, paddingBottom: 96, flexDirection: 'row', gap: 8 }}>
        {[
          { label: 'Delete', decision: 'DELETE_STAGED' as const },
          { label: 'Skip', decision: 'SKIP_LATER' as const },
          { label: 'Keep', decision: 'KEEP' as const },
          { label: 'Favorite', decision: 'FAVORITE' as const },
        ].map((action) => (
          <Pressable
            key={action.decision}
            onPress={() => {
              const nextId = manualDecisionId + 1;
              setManualDecisionId(nextId);
              setManualDecision({ id: nextId, decision: action.decision });
            }}
            accessibilityRole="button"
            accessibilityLabel={action.label}
            accessibilityHint={`Marks the current photo as ${action.label.toLowerCase()}`}
            style={{
              flex: 1,
              backgroundColor: '#ffffff',
              borderWidth: 1,
              borderColor: '#d7dde4',
              borderRadius: 10,
              paddingVertical: 10,
              alignItems: 'center',
            }}
          >
            <Text style={{ color: '#2e3a46', fontWeight: '700', fontSize: 12 }}>{action.label}</Text>
          </Pressable>
        ))}
      </View>

      <UndoButton disabled={session.undoStack.length === 0} onPress={onUndo} successTick={undoSuccessTick} />
      </View>
    </ScreenErrorBoundary>
  );
}
