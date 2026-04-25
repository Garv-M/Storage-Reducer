import { Text, View } from 'react-native';

import { useStatsStore } from '@/stores/statsStore';
import { bytesToHuman } from '@/utils/format';

const StatCard = ({ label, value }: { label: string; value: string }) => (
  <View style={{ flex: 1, minWidth: '48%', backgroundColor: '#ffffff', borderWidth: 1, borderColor: '#d7dde4', borderRadius: 12, padding: 12 }}>
    <Text style={{ color: '#2e3a46', fontSize: 12 }}>{label}</Text>
    <Text style={{ color: '#1b242d', fontSize: 18, fontWeight: '700', marginTop: 4 }}>{value}</Text>
  </View>
);

export function StatsDashboard() {
  const totalFreedBytes = useStatsStore((state) => state.totalFreedBytes);
  const photosReviewed = useStatsStore((state) => state.photosReviewed);
  const favoritesCount = useStatsStore((state) => state.favoritesCount);
  const sessionsCompleted = useStatsStore((state) => state.sessionsCompleted);
  const streak = useStatsStore((state) => state.streak);

  return (
    <View style={{ gap: 8 }}>
      <Text style={{ fontSize: 18, fontWeight: '700', color: '#2e3a46' }}>Your Stats</Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
        <StatCard label="Storage freed" value={bytesToHuman(totalFreedBytes)} />
        <StatCard label="Photos reviewed" value={String(photosReviewed)} />
        <StatCard label="Favorites" value={String(favoritesCount)} />
        <StatCard label="Sessions completed" value={String(sessionsCompleted)} />
      </View>
      <Text style={{ color: '#2e3a46', fontWeight: '600' }}>{`Current streak: ${streak.current} day${streak.current === 1 ? '' : 's'}`}</Text>
    </View>
  );
}
