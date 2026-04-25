import { Modal, Pressable, Text, View } from 'react-native';

import { bytesToHuman, dateFmt } from '@/utils/format';

interface MetadataSheetProps {
  visible: boolean;
  onClose: () => void;
  metadata: {
    filename: string;
    createdAt: number;
    bytes: number;
    albums: string[];
    location?: string;
  } | null;
}

export function MetadataSheet({ visible, onClose, metadata }: MetadataSheetProps) {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.35)' }} onPress={onClose}>
        <View style={{ marginTop: 'auto', backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 16 }}>
          <Text style={{ fontSize: 18, fontWeight: '700' }}>{metadata?.filename ?? 'Metadata'}</Text>
          <Text style={{ marginTop: 8 }}>{`Date: ${metadata ? dateFmt(metadata.createdAt) : '—'}`}</Text>
          <Text style={{ marginTop: 4 }}>{`Size: ${metadata ? bytesToHuman(metadata.bytes) : '—'}`}</Text>
          <Text style={{ marginTop: 4 }}>{`Albums: ${metadata?.albums.join(', ') || 'None'}`}</Text>
          <Text style={{ marginTop: 4 }}>{`Location: ${metadata?.location ?? 'Unknown'}`}</Text>
          <Pressable onPress={onClose} style={{ marginTop: 12, alignSelf: 'flex-start' }}>
            <Text style={{ color: '#0053e2', fontWeight: '600' }}>Close</Text>
          </Pressable>
        </View>
      </Pressable>
    </Modal>
  );
}
