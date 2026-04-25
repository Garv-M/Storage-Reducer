import { Pressable, Text } from 'react-native';

interface UndoButtonProps {
  disabled: boolean;
  onPress: () => void;
}

export function UndoButton({ disabled, onPress }: UndoButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={{
        position: 'absolute',
        bottom: 24,
        right: 20,
        backgroundColor: disabled ? '#a2afc0' : '#0053e2',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 999,
      }}
    >
      <Text style={{ color: '#fff', fontWeight: '700' }}>Undo</Text>
    </Pressable>
  );
}
