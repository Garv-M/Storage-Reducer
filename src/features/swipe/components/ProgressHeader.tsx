import { View, Text } from 'react-native';

import { bytesToHuman } from '@/utils/format';

interface ProgressHeaderProps {
  reviewed: number;
  total: number;
  freedBytes: number;
}

export function ProgressHeader({ reviewed, total, freedBytes }: ProgressHeaderProps) {
  const progress = total > 0 ? reviewed / total : 0;

  return (
    <View style={{ paddingHorizontal: 16, paddingTop: 8, paddingBottom: 12 }}>
      <Text style={{ fontWeight: '600', color: '#2e3a46' }}>{`${reviewed} of ${Math.max(total, reviewed)} reviewed · ${bytesToHuman(freedBytes)} freed`}</Text>
      <View style={{ marginTop: 8, height: 8, borderRadius: 999, backgroundColor: '#d7dde4' }}>
        <View style={{ width: `${Math.min(progress * 100, 100)}%`, height: '100%', borderRadius: 999, backgroundColor: '#0053e2' }} />
      </View>
    </View>
  );
}
