// UI Primitive: Card
// Non-interactive layout container used to group related content in a surface
// with consistent radius, spacing affordance, and optional elevation treatment.

import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import type { ViewStyle } from 'react-native';

import { colors } from '@/ui/theme/colors';

// ── Types ─────────────────────────────────────────────────────────────────────
/**
 * Visual surface treatments for card containers.
 */
export type CardVariant = 'elevated' | 'outlined' | 'filled';

/**
 * Props for the Card primitive.
 */
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
    // Shadow values are tuned to look balanced across iOS shadow model and
    // Android elevation so cards feel similarly lifted on both platforms.
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
/**
 * Presentational card wrapper.
 *
 * WHY non-interactive: interaction semantics (button/link/pressable) should be
 * added by the caller to avoid ambiguous accessibility roles on plain content.
 */
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
    // Clips filled backgrounds and child media to maintain the rounded silhouette.
    overflow: 'hidden',
  },
});
