import { Modal, Pressable, Text, View } from 'react-native';

import { bytesToHuman } from '@/utils/format';

interface ConfirmModalProps {
  visible: boolean;
  count: number;
  totalBytes: number;
  onCancel: () => void;
  onConfirm: () => void;
}

export function ConfirmModal({ visible, count, totalBytes, onCancel, onConfirm }: ConfirmModalProps) {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.35)', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
        <View style={{ backgroundColor: '#fff', width: '100%', borderRadius: 16, padding: 16 }}>
          <Text style={{ fontSize: 18, fontWeight: '700' }}>Confirm Cleanup</Text>
          <Text style={{ marginTop: 8 }}>{`${count} items staged`}</Text>
          <Text style={{ marginTop: 4 }}>{`${bytesToHuman(totalBytes)} will be reclaimed (estimated)`}</Text>
          <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginTop: 16, gap: 12 }}>
            <Pressable onPress={onCancel}>
          <Text style={{ color: '#2e3a46', fontWeight: '600' }}>Cancel</Text>
            </Pressable>
            <Pressable onPress={onConfirm}>
              <Text style={{ color: '#ea1100', fontWeight: '700' }}>Confirm Cleanup</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}
