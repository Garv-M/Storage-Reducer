import { useEffect, useState } from 'react';

import { Pressable, Text, View } from 'react-native';

import { getAssetsCreatedAfter } from '@/services/media/MediaLibrary';
import { useSessionStore } from '@/stores/sessionStore';
import { useSettingsStore } from '@/stores/settingsStore';
import { useStatsStore } from '@/stores/statsStore';

interface NewPhotoNudgeProps {
  onStartSession: (sessionId: string) => void;
}

export function NewPhotoNudge({ onStartSession }: NewPhotoNudgeProps) {
  const [newAssetIds, setNewAssetIds] = useState<string[]>([]);

  const createSession = useSessionStore((state) => state.createSession);
  const lastReviewedAssetCreatedAt = useStatsStore((state) => state.lastReviewedAssetCreatedAt);
  const incognito = useSettingsStore((state) => state.incognito);

  useEffect(() => {
    if (!lastReviewedAssetCreatedAt) return;

    void (async () => {
      const page = await getAssetsCreatedAfter(lastReviewedAssetCreatedAt);
      setNewAssetIds(page.assets.map((asset) => asset.id));
    })();
  }, [lastReviewedAssetCreatedAt]);

  if (!newAssetIds.length) return null;

  return (
    <Pressable
      onPress={() => {
        const session = createSession({ queueIds: newAssetIds, incognito });
        onStartSession(session.id);
      }}
      style={{ marginTop: 16, borderWidth: 1, borderColor: '#ffc220', backgroundColor: '#fff8e1', borderRadius: 12, padding: 12 }}
    >
      <Text style={{ color: '#995213', fontWeight: '700' }}>{`${newAssetIds.length} new photos since your last cleanup!`}</Text>
      <Text style={{ color: '#995213', marginTop: 4 }}>Tap to review only new photos.</Text>
    </Pressable>
  );
}
