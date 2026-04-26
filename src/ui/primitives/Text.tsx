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

// Weight → font family mapping
const weightToFamily: Record<FontWeightKey, string> = {
  regular: fontFamilies.regular,
  medium: fontFamilies.medium,
  semibold: fontFamilies.semibold,
  bold: fontFamilies.bold,
};

// Default color per variant
const variantDefaultColor: Record<TextVariant, string> = {
  hero: colors.gray180,
  title: colors.gray180,
  heading: colors.gray180,
  body: colors.gray180,
  caption: colors.gray160,
  label: colors.gray160,
};

// ── Component ─────────────────────────────────────────────────────────────────
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

  // Resolve font family — explicit weight prop wins, otherwise derive from variant weight
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
    >
      {children}
    </RNText>
  );
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function getWeightKey(weight: string): FontWeightKey {
  const map: Record<string, FontWeightKey> = {
    [fontWeights.regular]: 'regular',
    [fontWeights.medium]: 'medium',
    [fontWeights.semibold]: 'semibold',
    [fontWeights.bold]: 'bold',
  };
  return map[weight] ?? 'regular';
}
