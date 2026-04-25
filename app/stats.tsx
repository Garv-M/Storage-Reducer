import { View } from 'react-native';

import { StatsDashboard } from '@/features/stats/components/StatsDashboard';

export default function StatsScreen() {
  return (
    <View style={{ flex: 1, backgroundColor: '#ffffff', paddingTop: 56, paddingHorizontal: 16 }}>
      <StatsDashboard />
    </View>
  );
}
