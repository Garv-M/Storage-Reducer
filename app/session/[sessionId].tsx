import { useEffect, useMemo, useState } from 'react';

import { useLocalSearchParams, useRouter } from 'expo-router';
import { ActivityIndicator, Text, View } from 'react-native';

import { useHiddenAlbumGuard } from '@/features/lock/hooks/useHiddenAlbumGuard';
import { ProgressHeader } from '@/features/swipe/components/ProgressHeader';
import { SwipeStack } from '@/features/swipe/components/SwipeStack';
import { UndoButton } from '@/features/swipe/components/UndoButton';
import { useSessionQueue } from '@/features/swipe/hooks/useSessionQueue';
import { useShakeToUndo } from '@/features/swipe/hooks/useShakeToUndo';
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

  const hiddenSource = useMemo(() => session?.filterId?.toLowerCase().includes('hidden') ?? false, [session?.filterId]);
  const { isAuthorized: hiddenAuthorized } = useHiddenAlbumGuard(hiddenSource);

  const { assets, isLoading, skippedProtectedCount, clearSkippedProtectedCount } = useSessionQueue(
    sessionId ?? '',
    !hiddenSource || hiddenAuthorized
  );
  const [skipMessage, setSkipMessage] = useState<string | null>(null);

  const isIncognito = useMemo(() => Boolean(session?.incognito), [session?.incognito]);

  useEffect(() => {
    if (session?.id) {
      setActiveSession(session.id);
    }
  }, [session?.id, setActiveSession]);

  const onSwipeComplete = (decision: Decision, asset: Asset) => {
    const bytes = decision === 'DELETE_STAGED' ? asset.bytes : 0;

    recordDecision(asset.id, decision, bytes);

    if (!isIncognito) {
      incrementReviewed(asset.createdAt);

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

  return (
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
        <SwipeStack assets={assets} onSwipeComplete={onSwipeComplete} />
      </View>

      <UndoButton disabled={session.undoStack.length === 0} onPress={onUndo} />
    </View>
  );
}
