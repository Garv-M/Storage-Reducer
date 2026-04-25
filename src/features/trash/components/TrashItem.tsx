import { Pressable, Text, View } from 'react-native';
import { Image } from 'expo-image';

import type { ConfirmedTrashItem } from '@/stores/trashStore';

interface TrashItemProps {
  item: ConfirmedTrashItem;
  selected: boolean;
  selectionMode: boolean;
  onPress: (assetId: string) => void;
  onLongPress: (assetId: string) => void;
}

const daysLeft = (expiresAt: number) => Math.max(0, Math.ceil((expiresAt - Date.now()) / 86400000));

export function TrashItem({ item, selected, selectionMode, onPress, onLongPress }: TrashItemProps) {
  return (
    <Pressable onPress={() => onPress(item.assetId)} onLongPress={() => onLongPress(item.assetId)} style={{ flex: 1 / 3, padding: 4 }}>
      <View style={{ borderRadius: 8, overflow: 'hidden', borderColor: selected ? '#0053e2' : '#d7dde4', borderWidth: selectionMode ? 2 : 1 }}>
        <Image source={{ uri: item.uri }} style={{ width: '100%', aspectRatio: 1 }} contentFit="cover" />
        <View style={{ position: 'absolute', top: 6, left: 6, backgroundColor: '#fff8e1', borderRadius: 999, paddingHorizontal: 8, paddingVertical: 2 }}>
          <Text style={{ color: '#995213', fontSize: 10, fontWeight: '700' }}>{`${daysLeft(item.expiresAt)}d left`}</Text>
        </View>
        {selectionMode ? (
          <View style={{ position: 'absolute', top: 6, right: 6, backgroundColor: '#ffffff', borderRadius: 999, width: 18, height: 18, alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ color: '#0053e2', fontSize: 11 }}>{selected ? '✓' : ''}</Text>
          </View>
        ) : null}
      </View>
    </Pressable>
  );
}
