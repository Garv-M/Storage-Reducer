import { useEffect } from 'react';

import { useLocalSearchParams, useRouter } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';

import { ProgressHeader } from '@/features/swipe/components/ProgressHeader';
import { SwipeStack } from '@/features/swipe/components/SwipeStack';
import { UndoButton } from '@/features/swipe/components/UndoButton';
import { useSessionQueue } from '@/features/swipe/hooks/useSessionQueue';
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

  const { assets, isLoading } = useSessionQueue(sessionId ?? '');

  useEffect(() => {
    if (session?.id) {
      setActiveSession(session.id);
    }
  }, [session?.id, setActiveSession]);

  const onSwipeComplete = (decision: Decision, asset: Asset) => {
    const bytes = decision === 'DELETE_STAGED' ? asset.bytes : 0;

    recordDecision(asset.id, decision, bytes);
    incrementReviewed();

    if (decision === 'DELETE_STAGED') {
      addStaged(asset);
    }

    if (decision === 'FAVORITE') {
      incrementFavorites();
    }
  };

  const onUndo = () => {
    const undone = undo();
    if (!undone) return;

    if (undone.decision === 'DELETE_STAGED') {
      removeStaged(undone.assetId);
    }
  };

  if (!sessionId || !session) {
    router.replace('/(tabs)/home');
    return null;
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#fff', paddingTop: 50 }}>
      <ProgressHeader
        reviewed={session.decisions.length}
        total={Math.max(session.queueIds.length, assets.length)}
        freedBytes={session.freedBytesEstimated}
      />

      <View style={{ flex: 1, padding: 12 }}>
        {isLoading && assets.length === 0 ? <ActivityIndicator size="large" color="#0053e2" /> : null}
        <SwipeStack assets={assets} onSwipeComplete={onSwipeComplete} />
      </View>

      <UndoButton disabled={session.undoStack.length === 0} onPress={onUndo} />
    </View>
  );
}
