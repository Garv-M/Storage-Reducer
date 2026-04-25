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
  const relatedAlbums = item.albumIds.slice(1);

  return (
    <Pressable disabled={item.isShared} onPress={() => onToggle(item.assetId)} style={{ flex: 1 / 3, padding: 4, opacity: item.isShared ? 0.85 : 1 }}>
      <View style={{ borderRadius: 8, overflow: 'hidden', borderWidth: selected ? 2 : 0, borderColor: '#0053e2' }}>
        <Image source={{ uri: item.uri }} style={{ width: '100%', aspectRatio: 1 }} contentFit="cover" />
        <View style={{ position: 'absolute', top: 6, right: 6, backgroundColor: '#fff', borderRadius: 999, width: 18, height: 18, alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ color: '#0053e2', fontSize: 11 }}>{selected ? '✓' : ''}</Text>
        </View>
        {item.isCloudOnly ? (
          <View style={{ position: 'absolute', top: 6, left: 6, backgroundColor: '#fff8e1', borderRadius: 999, paddingHorizontal: 7, paddingVertical: 2 }}>
            <Text style={{ color: '#995213', fontSize: 10, fontWeight: '700' }}>iCloud</Text>
          </View>
        ) : null}
        {item.isShared ? (
          <View style={{ position: 'absolute', left: 6, right: 6, bottom: 24, backgroundColor: 'rgba(0,0,0,0.65)', borderRadius: 6, paddingHorizontal: 6, paddingVertical: 3 }}>
            <Text style={{ color: '#fff', fontSize: 10, fontWeight: '700' }}>Shared - can't delete</Text>
          </View>
        ) : null}
        <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: 'rgba(0,0,0,0.45)', paddingHorizontal: 6, paddingVertical: 3 }}>
          <Text style={{ color: '#fff', fontSize: 10 }}>{bytesToHuman(item.bytes)}</Text>
          {relatedAlbums.length > 0 ? <Text style={{ color: '#fff', fontSize: 9 }}>{`Also in: ${relatedAlbums.join(', ')}`}</Text> : null}
        </View>
      </View>
    </Pressable>
  );
}
