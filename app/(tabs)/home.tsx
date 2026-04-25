import { useMemo } from 'react';

import { useRouter } from 'expo-router';
import { Pressable, Text, View } from 'react-native';

import { useSessionStore } from '@/stores/sessionStore';
import { useSettingsStore } from '@/stores/settingsStore';
import { StatsDashboard } from '@/features/stats/components/StatsDashboard';
import { useStatsStore } from '@/stores/statsStore';
import { useTrashStore } from '@/stores/trashStore';

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
    <View className="flex-1 bg-white px-6 pt-12">
      <Text style={{ fontSize: 26, fontWeight: '700', color: '#2e3a46' }}>Storage Reducer</Text>
      <Text style={{ marginTop: 6, color: '#2e3a46' }}>Swipe photos and stage cleanup safely.</Text>

      {resumable ? (
        <Pressable onPress={resume} style={{ marginTop: 20, borderWidth: 1, borderColor: '#d7dde4', borderRadius: 12, padding: 12 }}>
          <Text style={{ fontWeight: '700', color: '#2e3a46' }}>Resume previous session</Text>
          <Text style={{ marginTop: 4, color: '#2e3a46' }}>{`Started ${new Date(resumable.createdAt).toLocaleString()}`}</Text>
        </Pressable>
      ) : null}

      <View style={{ marginTop: 20 }}>
        <StatsDashboard />
      </View>

      {confirmedTrash.length > 0 ? (
        <View style={{ marginTop: 16, borderWidth: 1, borderColor: '#ffc220', backgroundColor: '#fff8e1', borderRadius: 12, padding: 12 }}>
          <Text style={{ color: '#995213', fontWeight: '700' }}>{`${confirmedTrash.length} photos in trash`}</Text>
          <Text style={{ color: '#995213', marginTop: 4 }}>Some items are expiring soon. Open Trash to restore or delete now.</Text>
        </View>
      ) : null}

      <Pressable onPress={startReview} style={{ marginTop: 20, backgroundColor: '#0053e2', borderRadius: 12, padding: 14, alignItems: 'center' }}>
        <Text style={{ color: '#fff', fontWeight: '700' }}>Start Review</Text>
      </Pressable>
    </View>
  );
}
