import { useEffect, useMemo, useState } from 'react';

import { useRouter } from 'expo-router';
import { Pressable, Text, View } from 'react-native';

import { useSessionStore } from '@/stores/sessionStore';
import { useSettingsStore } from '@/stores/settingsStore';
import { ScreenErrorBoundary } from '@/components/ScreenErrorBoundary';
import { NewPhotoNudge } from '@/features/nudges/NewPhotoNudge';
import { StatsDashboard } from '@/features/stats/components/StatsDashboard';
import { getAssets, getPermissions, requestPermissions } from '@/services/media/MediaLibrary';
import { useStatsStore } from '@/stores/statsStore';
import { useTrashStore } from '@/stores/trashStore';

export default function HomeTabScreen() {
  const router = useRouter();

  const createSession = useSessionStore((state) => state.createSession);
  const findResumable = useSessionStore((state) => state.findResumable);
  const setActiveSession = useSessionStore((state) => state.setActiveSession);

  const incognito = useSettingsStore((state) => state.incognito);
  const photosReviewed = useStatsStore((state) => state.photosReviewed);
  const streak = useStatsStore((state) => state.streak);
  const confirmedTrash = useTrashStore((state) => state.confirmed);
  const [isPermissionGranted, setIsPermissionGranted] = useState<boolean | null>(null);
  const [hasReviewablePhotos, setHasReviewablePhotos] = useState(true);

  const resumable = useMemo(() => findResumable(), [findResumable, photosReviewed]);

  useEffect(() => {
    void (async () => {
      const permission = await getPermissions();
      setIsPermissionGranted(permission.granted);

      if (!permission.granted) {
        setHasReviewablePhotos(false);
        return;
      }

      const firstPage = await getAssets(null, 1);
      setHasReviewablePhotos(firstPage.assets.length > 0);
    })();
  }, [photosReviewed]);

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
    <ScreenErrorBoundary title="Home screen failed" onRetry={() => router.replace('/(tabs)/home')}>
      <View className="flex-1 bg-white px-6 pt-12">
      <Text style={{ fontSize: 26, fontWeight: '700', color: '#2e3a46' }}>SwipeClean</Text>
      <Text style={{ marginTop: 6, color: '#2e3a46' }}>Swipe photos and stage cleanup safely.</Text>

      {streak.current > 1 ? (
        <View
          style={{ marginTop: 14, borderRadius: 12, borderWidth: 1, borderColor: '#ffc220', backgroundColor: '#fff8e1', padding: 10 }}
        >
          <Text style={{ color: '#995213', fontWeight: '700' }}>{`${streak.current}-day streak 🔥`}</Text>
        </View>
      ) : null}

      {resumable ? (
        <Pressable
          onPress={resume}
          accessibilityRole="button"
          accessibilityLabel="Resume previous session"
          accessibilityHint="Continues your in-progress review session"
          style={{ marginTop: 20, borderWidth: 1, borderColor: '#d7dde4', borderRadius: 12, padding: 12 }}
        >
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

      {!hasReviewablePhotos ? (
        <View style={{ marginTop: 16, borderRadius: 12, borderWidth: 1, borderColor: '#d7dde4', padding: 14, backgroundColor: '#f8f9fa' }}>
          <Text style={{ fontSize: 18 }}>📷</Text>
          <Text style={{ color: '#2e3a46', fontWeight: '700', marginTop: 6 }}>No photos to review!</Text>
          <Text style={{ color: '#2e3a46', marginTop: 4 }}>
            {isPermissionGranted ? 'All photos are already reviewed.' : 'Allow gallery access to start reviewing photos.'}
          </Text>
          {!isPermissionGranted ? (
            <Pressable
              onPress={async () => {
                const permission = await requestPermissions();
                setIsPermissionGranted(permission.granted);
                if (permission.granted) {
                  const firstPage = await getAssets(null, 1);
                  setHasReviewablePhotos(firstPage.assets.length > 0);
                }
              }}
              accessibilityRole="button"
              accessibilityLabel="Allow gallery access"
              style={{ marginTop: 10, alignSelf: 'flex-start', borderRadius: 999, borderWidth: 1, borderColor: '#0053e2', paddingHorizontal: 12, paddingVertical: 6 }}
            >
              <Text style={{ color: '#0053e2', fontWeight: '700' }}>Allow Access</Text>
            </Pressable>
          ) : null}
        </View>
      ) : (
        <NewPhotoNudge onStartSession={(nextSessionId) => router.push(`/session/${nextSessionId}`)} />
      )}

      <Pressable
        onPress={startReview}
        disabled={!hasReviewablePhotos}
        accessibilityRole="button"
        accessibilityLabel="Start review"
        accessibilityHint="Starts a new photo review session"
        style={{
          marginTop: 20,
          backgroundColor: hasReviewablePhotos ? '#0053e2' : '#a2afc0',
          borderRadius: 12,
          padding: 14,
          alignItems: 'center',
        }}
      >
        <Text style={{ color: '#fff', fontWeight: '700' }}>Start Review</Text>
      </Pressable>
      </View>
    </ScreenErrorBoundary>
  );
}
