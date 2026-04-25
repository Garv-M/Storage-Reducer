import { ScrollView, Text, View } from 'react-native';

import { ScreenErrorBoundary } from '@/components/ScreenErrorBoundary';
import { useStatsStore } from '@/stores/statsStore';
import { bytesToHuman } from '@/utils/format';

const weekLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const buildWeeklyBars = (activity: Record<string, number>) => {
  const days = [...Array.from({ length: 7 }).keys()].map((offset) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - offset));
    return date;
  });

  const values = days.map((date) => activity[date.toISOString().slice(0, 10)] ?? 0);
  const max = Math.max(...values, 1);

  return values.map((value, index) => ({
    label: weekLabels[(days[index].getDay() + 6) % 7],
    value,
    height: Math.max((value / max) * 80, value > 0 ? 8 : 2),
  }));
};

const StatTile = ({ label, value }: { label: string; value: string }) => (
  <View style={{ width: '48%', borderRadius: 12, borderWidth: 1, borderColor: '#d7dde4', backgroundColor: '#fff', padding: 12 }}>
    <Text style={{ color: '#2e3a46', fontSize: 12 }}>{label}</Text>
    <Text style={{ marginTop: 4, color: '#1b242d', fontSize: 20, fontWeight: '700' }}>{value}</Text>
  </View>
);

export default function StatsScreen() {
  const totalFreedBytes = useStatsStore((state) => state.totalFreedBytes);
  const photosReviewed = useStatsStore((state) => state.photosReviewed);
  const favoritesCount = useStatsStore((state) => state.favoritesCount);
  const sessionsCompleted = useStatsStore((state) => state.sessionsCompleted);
  const streak = useStatsStore((state) => state.streak);
  const weeklyActivity = useStatsStore((state) => state.weeklyActivity);

  const bars = buildWeeklyBars(weeklyActivity);

  return (
    <ScreenErrorBoundary title="Stats unavailable">
      <ScrollView style={{ flex: 1, backgroundColor: '#fff' }} contentContainerStyle={{ padding: 16, paddingTop: 56, gap: 16 }}>
      <Text style={{ color: '#1b242d', fontSize: 24, fontWeight: '700' }}>Stats</Text>

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
        <StatTile label="Freed storage" value={bytesToHuman(totalFreedBytes)} />
        <StatTile label="Photos reviewed" value={String(photosReviewed)} />
        <StatTile label="Favorites" value={String(favoritesCount)} />
        <StatTile label="Sessions completed" value={String(sessionsCompleted)} />
      </View>

      <View style={{ borderRadius: 12, borderWidth: 1, borderColor: '#d7dde4', padding: 12 }}>
        <Text style={{ color: '#1b242d', fontWeight: '700' }}>Streak</Text>
        <Text style={{ color: '#2e3a46', marginTop: 6 }}>{`${streak.current} current day${streak.current === 1 ? '' : 's'}`}</Text>
        <Text style={{ color: '#2e3a46', marginTop: 4 }}>{`Longest: ${streak.longest} day${streak.longest === 1 ? '' : 's'}`}</Text>
      </View>

      <View style={{ borderRadius: 12, borderWidth: 1, borderColor: '#d7dde4', padding: 12 }}>
        <Text style={{ color: '#1b242d', fontWeight: '700' }}>Weekly Activity</Text>
        <View style={{ marginTop: 14, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          {bars.map((bar) => (
            <View key={bar.label} style={{ alignItems: 'center', width: 34 }}>
              <View style={{ width: 22, height: bar.height, borderRadius: 8, backgroundColor: '#0053e2' }} />
              <Text style={{ marginTop: 6, color: '#2e3a46', fontSize: 11 }}>{bar.label}</Text>
            </View>
          ))}
        </View>
      </View>
      </ScrollView>
    </ScreenErrorBoundary>
  );
}
