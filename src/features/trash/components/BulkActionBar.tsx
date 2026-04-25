import { Pressable, Text, View } from 'react-native';

interface BulkActionBarProps {
  selectedCount: number;
  onRestore: () => void;
  onDeleteNow: () => void;
}

export function BulkActionBar({ selectedCount, onRestore, onDeleteNow }: BulkActionBarProps) {
  if (selectedCount <= 0) return null;

  return (
    <View style={{ borderTopWidth: 1, borderTopColor: '#d7dde4', backgroundColor: '#ffffff', padding: 12, flexDirection: 'row', alignItems: 'center', gap: 8 }}>
      <Text style={{ flex: 1, color: '#2e3a46', fontWeight: '600' }}>{`${selectedCount} selected`}</Text>
      <Pressable onPress={onRestore} style={{ borderWidth: 1, borderColor: '#d7dde4', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10 }}>
        <Text style={{ color: '#2e3a46', fontWeight: '600' }}>Restore Selected</Text>
      </Pressable>
      <Pressable onPress={onDeleteNow} style={{ backgroundColor: '#ea1100', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10 }}>
        <Text style={{ color: '#ffffff', fontWeight: '700' }}>Delete Now</Text>
      </Pressable>
    </View>
  );
}
