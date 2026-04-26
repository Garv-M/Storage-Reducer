// StatsDashboard summarizes progress signals from cleanup sessions.
// It favors glanceable, card-based metrics so users can see momentum and
// reclaimed storage without leaving the main workflow.

import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, View } from 'react-native';

import { useStatsStore } from '@/stores/statsStore';
import { Card } from '@/ui/primitives/Card';
import { Text } from '@/ui/primitives/Text';
import { colors } from '@/ui/theme/colors';
import { bytesToHuman } from '@/utils/format';

// ── Constants ─────────────────────────────────────────────────────────────────
const STAT_CONFIGS = [
  { key: 'freed', icon: 'cloud-download' as const, label: 'Storage freed' },
  { key: 'reviewed', icon: 'images' as const, label: 'Photos reviewed' },
  { key: 'favorites', icon: 'heart' as const, label: 'Favorites' },
  { key: 'sessions', icon: 'layers' as const, label: 'Sessions done' },
] as const;

// ── Component ─────────────────────────────────────────────────────────────────
/**
 * Renders user-facing cleanup KPIs in a responsive two-column card grid.
 *
 * Storage-freed metric is visually emphasized to reinforce tangible benefit.
 */
export function StatsDashboard() {
  const totalFreedBytes = useStatsStore((state) => state.totalFreedBytes);
  const photosReviewed = useStatsStore((state) => state.photosReviewed);
  const favoritesCount = useStatsStore((state) => state.favoritesCount);
  const sessionsCompleted = useStatsStore((state) => state.sessionsCompleted);

  const values: Record<string, string> = {
    freed: bytesToHuman(totalFreedBytes),
    reviewed: String(photosReviewed),
    favorites: String(favoritesCount),
    sessions: String(sessionsCompleted),
  };

  return (
    <View style={styles.grid}>
      {STAT_CONFIGS.map(({ key, icon, label }) => (
        <Card key={key} variant="outlined" padding={12} style={styles.card} accessibilityLabel={`${label}: ${values[key]}`}>
          <Ionicons name={icon} size={24} color={key === 'freed' ? colors.blue100 : colors.gray160} />
          <Text variant="title" color={key === 'freed' ? colors.blue100 : colors.gray180} style={styles.value}>
            {values[key]}
          </Text>
          <Text variant="caption" color={colors.light.textSecondary}>{label}</Text>
        </Card>
      ))}
    </View>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  // Wrap + minWidth yields stable 2-up cards across device sizes/orientation.
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  card: { flex: 1, minWidth: '48%', gap: 4 },
  value: { marginTop: 4 },
});