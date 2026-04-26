// UI Primitive: Text
// Semantic typography wrapper that maps design-system text variants to concrete
// font family, size, and line-height tokens loaded from Plus Jakarta Sans.

import type { ReactNode } from 'react';
import { Text as RNText, StyleSheet } from 'react-native';
import type { TextStyle } from 'react-native';

import { colors } from '@/ui/theme/colors';
import {
  fontFamilies,
  fontWeights,
  textVariants,
  type FontWeightKey,
  type TextVariant,
} from '@/ui/theme/typography';

// ── Types ─────────────────────────────────────────────────────────────────────
/**
 * Props for the Text primitive.
 */
export interface TextProps {
  children: ReactNode;
  variant?: TextVariant;
  /** Override text color — accepts any string (use color tokens). */
  color?: string;
  weight?: FontWeightKey;
  /** Additional styles. */
  style?: TextStyle;
  numberOfLines?: number;
  accessibilityLabel?: string;
  selectable?: boolean;
}

// ── Token lookup maps ─────────────────────────────────────────────────────────
// Weight keys resolve to actual loaded font-family names.
const weightToFamily: Record<FontWeightKey, string> = {
  regular: fontFamilies.regular,
  medium: fontFamilies.medium,
  semibold: fontFamilies.semibold,
  bold: fontFamilies.bold,
};

// Defaults preserve hierarchy while keeping text on accessible gray ramps.
const variantDefaultColor: Record<TextVariant, string> = {
  hero: colors.gray180,
  title: colors.gray180,
  heading: colors.gray180,
  body: colors.gray180,
  caption: colors.gray160,
  label: colors.gray160,
};

// ── Component ─────────────────────────────────────────────────────────────────
/**
 * Semantic text wrapper for consistent typography and optional overrides.
 */
export function Text({
  children,
  variant = 'body',
  color,
  weight,
  style,
  numberOfLines,
  accessibilityLabel,
  selectable = false,
}: TextProps) {
  const vStyle = textVariants[variant];

  // Explicit `weight` wins; otherwise derive from variant metadata so callers
  // can stay semantic by default and only override when truly necessary.
  const resolvedWeight = weight ?? getWeightKey(vStyle.weight);
  const fontFamily = weightToFamily[resolvedWeight] ?? fontFamilies.regular;

  const textColor = color ?? variantDefaultColor[variant];

  return (
    <RNText
      style={[
        {
          fontSize: vStyle.size,
          lineHeight: vStyle.lineHeight,
          fontFamily,
          color: textColor,
        },
        style,
      ]}
      numberOfLines={numberOfLines}
      accessibilityLabel={accessibilityLabel}
      selectable={selectable}
      // We intentionally do not force accessibilityRole="text" here because
      // native Text already exposes correct semantics in most contexts.
    >
      {children}
    </RNText>
  );
}

// ── Helpers ───────────────────────────────────────────────────────────────────
/**
 * Converts numeric weight tokens to semantic keys used by `weightToFamily`.
 */
function getWeightKey(weight: string): FontWeightKey {
  const map: Record<string, FontWeightKey> = {
    [fontWeights.regular]: 'regular',
    [fontWeights.medium]: 'medium',
    [fontWeights.semibold]: 'semibold',
    [fontWeights.bold]: 'bold',
  };
  return map[weight] ?? 'regular';
}
