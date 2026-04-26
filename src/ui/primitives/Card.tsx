import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import type { ViewStyle } from 'react-native';

import { colors } from '@/ui/theme/colors';

// ── Types ─────────────────────────────────────────────────────────────────────
export type CardVariant = 'elevated' | 'outlined' | 'filled';

export interface CardProps {
  children: ReactNode;
  variant?: CardVariant;
  /** Padding inside the card. Defaults to 16. */
  padding?: number;
  style?: ViewStyle;
  accessibilityLabel?: string;
}

// ── Variant styles ────────────────────────────────────────────────────────────
const variantStyles: Record<CardVariant, ViewStyle> = {
  elevated: {
    backgroundColor: colors.white,
    shadowColor: colors.gray180,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  outlined: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.gray50,
  },
  filled: {
    backgroundColor: colors.gray5,
  },
};

// ── Component ─────────────────────────────────────────────────────────────────
export function Card({
  children,
  variant = 'elevated',
  padding = 16,
  style,
  accessibilityLabel,
}: CardProps) {
  return (
    <View
      style={[styles.base, variantStyles[variant], { padding }, style]}
      accessibilityLabel={accessibilityLabel}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: 20,
    overflow: 'hidden',
  },
});
