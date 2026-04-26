import { Ionicons } from '@expo/vector-icons';
import type { ReactNode } from 'react';
import {
  Modal as RNModal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors } from '@/ui/theme/colors';
import { fontFamilies, fontSizes } from '@/ui/theme/typography';

// ── Types ─────────────────────────────────────────────────────────────────────
export interface ModalProps {
  visible: boolean;
  onClose: () => void;
  children: ReactNode;
  title?: string;
  /** If true, tapping the backdrop closes the modal. Default true. */
  dismissOnBackdrop?: boolean;
}

// ── Component ─────────────────────────────────────────────────────────────────
export function Modal({
  visible,
  onClose,
  children,
  title,
  dismissOnBackdrop = true,
}: ModalProps) {
  const insets = useSafeAreaInsets();
  const scale = useSharedValue(0.92);
  const opacity = useSharedValue(0);

  const containerStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const handleShow = () => {
    scale.value = withSpring(1, { damping: 20, stiffness: 260 });
    opacity.value = withTiming(1, { duration: 180 });
  };

  const handleHide = () => {
    scale.value = withSpring(0.92, { damping: 20, stiffness: 260 });
    opacity.value = withTiming(0, { duration: 140 });
  };

  return (
    <RNModal
      transparent
      visible={visible}
      animationType="none"
      onShow={handleShow}
      onRequestClose={onClose}
      statusBarTranslucent
      accessibilityViewIsModal
    >
      <Pressable
        style={styles.backdrop}
        onPress={dismissOnBackdrop ? onClose : undefined}
        accessibilityLabel="Close modal"
        accessibilityRole="button"
      >
        {/* Inner pressable stops propagation so tapping content doesn't close */}
        <Pressable onPress={() => {}} style={styles.pressableStop}>
          <Animated.View
            style={[
              styles.sheet,
              { paddingBottom: Math.max(insets.bottom, 16) },
              containerStyle,
            ]}
            accessibilityLabel={title}
          >
            {/* Header */}
            <View style={styles.header}>
              {title && (
                <Text style={styles.title} numberOfLines={1}>
                  {title}
                </Text>
              )}
              <Pressable
                onPress={onClose}
                hitSlop={12}
                style={styles.closeBtn}
                accessibilityRole="button"
                accessibilityLabel="Close"
              >
                <Ionicons name="close" size={22} color={colors.gray160} />
              </Pressable>
            </View>

            {/* Content */}
            <View style={styles.content}>{children}</View>
          </Animated.View>
        </Pressable>
      </Pressable>
    </RNModal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(27,36,45,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  pressableStop: {
    width: '100%',
  },
  sheet: {
    backgroundColor: colors.white,
    borderRadius: 24,
    width: '100%',
    paddingTop: 20,
    paddingHorizontal: 20,
    shadowColor: colors.gray180,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 24,
    elevation: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  title: {
    flex: 1,
    fontSize: fontSizes.lg,
    fontFamily: fontFamilies.bold,
    color: colors.gray180,
    paddingRight: 12,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.gray10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    // children control their own padding
  },
});
