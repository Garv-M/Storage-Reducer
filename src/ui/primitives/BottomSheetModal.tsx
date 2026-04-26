// UI Primitive: BottomSheetModal
// Wrapper over @gorhom/bottom-sheet v5 for draggable, snap-point-based modals.
// This primitive standardizes backdrop behavior, shape tokens, and accessibility
// semantics so feature teams can focus on content.

/**
 * BottomSheetModal — wraps @gorhom/bottom-sheet v5.
 *
 * Usage: Mount <BottomSheetModalProvider> once in your root layout,
 * then use this component anywhere in the tree.
 *
 * IMPORTANT: Your root layout must wrap children with BottomSheetModalProvider
 * from @gorhom/bottom-sheet for modals to render correctly.
 */
import {
  BottomSheetBackdrop,
  BottomSheetModal as GorhomBottomSheetModal,
  BottomSheetView,
} from '@gorhom/bottom-sheet';
import type { ReactNode } from 'react';
import { useCallback, useEffect, useRef } from 'react';
import { StyleSheet, View } from 'react-native';

import { colors } from '@/ui/theme/colors';

// ── Types ─────────────────────────────────────────────────────────────────────
/**
 * Props for the BottomSheetModal primitive.
 */
export interface BottomSheetModalProps {
  visible: boolean;
  onClose: () => void;
  children: ReactNode;
  /** Snap-point array. Defaults to ['50%', '90%']. */
  snapPoints?: string[];
}

// ── Component ─────────────────────────────────────────────────────────────────
/**
 * Draggable bottom-sheet modal with configurable snap points.
 */
export function BottomSheetModal({
  visible,
  onClose,
  children,
  snapPoints = ['50%', '90%'],
}: BottomSheetModalProps) {
  const ref = useRef<GorhomBottomSheetModal>(null);

  // Drive present/dismiss imperatively from declarative `visible` prop.
  useEffect(() => {
    if (visible) {
      ref.current?.present();
    } else {
      ref.current?.dismiss();
    }
  }, [visible]);

  const renderBackdrop = useCallback(
    (props: Parameters<typeof BottomSheetBackdrop>[0]) => (
      <BottomSheetBackdrop
        {...props}
        appearsOnIndex={0}
        disappearsOnIndex={-1}
        opacity={0.5}
        pressBehavior="close"
        accessibilityLabel="Close bottom sheet"
        accessibilityRole="button"
      />
    ),
    []
  );

  return (
    <GorhomBottomSheetModal
      ref={ref}
      index={0}
      // Percentage snap points scale naturally across devices/orientations.
      snapPoints={snapPoints}
      onDismiss={onClose}
      backdropComponent={renderBackdrop}
      handleIndicatorStyle={styles.handle}
      backgroundStyle={styles.background}
      // Pan-down handle drag is the primary dismiss affordance.
      enablePanDownToClose
      keyboardBehavior="interactive"
      keyboardBlurBehavior="restore"
      accessible
      accessibilityLabel="Bottom sheet"
      accessibilityViewIsModal
    >
      <BottomSheetView style={styles.contentContainer}>
        {/* Drag handle is rendered by the sheet itself. */}
        {children}
      </BottomSheetView>
    </GorhomBottomSheetModal>
  );
}

const styles = StyleSheet.create({
  background: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.gray50,
    alignSelf: 'center',
    marginTop: 8,
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingBottom: 32,
  },
});
