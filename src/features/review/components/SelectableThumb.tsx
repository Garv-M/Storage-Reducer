import { Pressable, Text, View } from 'react-native';
import { Image } from 'expo-image';

import type { StagedTrashItem } from '@/stores/trashStore';
import { bytesToHuman } from '@/utils/format';

interface SelectableThumbProps {
  item: StagedTrashItem;
  selected: boolean;
  onToggle: (assetId: string) => void;
}

export function SelectableThumb({ item, selected, onToggle }: SelectableThumbProps) {
  return (
    <Pressable onPress={() => onToggle(item.assetId)} style={{ flex: 1 / 3, padding: 4 }}>
      <View style={{ borderRadius: 8, overflow: 'hidden', borderWidth: selected ? 2 : 0, borderColor: '#0053e2' }}>
        <Image source={{ uri: item.uri }} style={{ width: '100%', aspectRatio: 1 }} contentFit="cover" />
        <View style={{ position: 'absolute', top: 6, right: 6, backgroundColor: '#fff', borderRadius: 999, width: 18, height: 18, alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ color: '#0053e2', fontSize: 11 }}>{selected ? '✓' : ''}</Text>
        </View>
        <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: 'rgba(0,0,0,0.45)', paddingHorizontal: 6, paddingVertical: 3 }}>
          <Text style={{ color: '#fff', fontSize: 10 }}>{bytesToHuman(item.bytes)}</Text>
        </View>
      </View>
    </Pressable>
  );
}
