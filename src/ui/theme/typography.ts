// UI Theme: Typography Tokens
// Provides the app-wide type scale and semantic text variants for Plus Jakarta Sans.
// The Text primitive consumes these tokens so sizing/weight decisions stay consistent
// and easy to evolve without touching feature code.

// ── Primitive Type Tokens ────────────────────────────────────────────────────
/**
 * Font size scale (pt/sp) from micro labels to hero display text.
 *
 * WHY: An 8-step scale gives enough contrast between UI roles while avoiding
 * one-off values that drift from the design system.
 */
export const fontSizes = {
  xxs: 10,
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 22,
  xxl: 28,
  hero: 34,
} as const;

/**
 * Named font-weight values used by semantic variants.
 *
 * WHY: Keeping the numeric strings centralized avoids mismatch between variant
 * metadata and runtime font-family selection logic.
 */
export const fontWeights = {
  regular: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
} as const;

/**
 * Line-height presets expressed as absolute values for React Native text styles.
 *
 * WHY: React Native expects numeric line heights; precomputing these values by
 * size keeps rhythm predictable and improves readability for dense photo metadata.
 */
export const lineHeights = {
  tight: {
    xxs: 14,
    xs: 16,
    sm: 18,
    md: 20,
    lg: 22,
    xl: 26,
    xxl: 32,
    hero: 38,
  },
  snug: {
    xxs: 15,
    xs: 17,
    sm: 20,
    md: 22,
    lg: 24,
    xl: 28,
    xxl: 36,
    hero: 42,
  },
  normal: {
    xxs: 16,
    xs: 18,
    sm: 22,
    md: 24,
    lg: 28,
    xl: 32,
    xxl: 40,
    hero: 48,
  },
  relaxed: {
    xxs: 18,
    xs: 20,
    sm: 24,
    md: 28,
    lg: 32,
    xl: 36,
    xxl: 44,
    hero: 52,
  },
} as const;

// ── Font Asset Mapping ────────────────────────────────────────────────────────
/**
 * Runtime font-family names loaded via expo-google-fonts.
 *
 * WHY: The string values must exactly match loaded asset names, so this map is
 * the single source of truth used across text primitives and styles.
 */
export const fontFamilies = {
  regular: 'PlusJakartaSans_400Regular',
  medium: 'PlusJakartaSans_500Medium',
  semibold: 'PlusJakartaSans_600SemiBold',
  bold: 'PlusJakartaSans_700Bold',
} as const;

// ── Semantic Variant Contract ────────────────────────────────────────────────
/**
 * Semantic typography variants consumed by the Text primitive.
 *
 * WHY: Feature code asks for intent (`body`, `heading`) while this layer maps
 * intent to exact size/line-height/weight tokens for consistency.
 */
export const textVariants = {
  hero: { size: fontSizes.hero, lineHeight: lineHeights.tight.hero, weight: fontWeights.bold },
  title: { size: fontSizes.xxl, lineHeight: lineHeights.tight.xxl, weight: fontWeights.bold },
  heading: { size: fontSizes.xl, lineHeight: lineHeights.snug.xl, weight: fontWeights.semibold },
  body: { size: fontSizes.md, lineHeight: lineHeights.normal.md, weight: fontWeights.regular },
  caption: { size: fontSizes.sm, lineHeight: lineHeights.normal.sm, weight: fontWeights.regular },
  label: { size: fontSizes.xs, lineHeight: lineHeights.tight.xs, weight: fontWeights.medium },
} as const;

/**
 * Variant names accepted by the Text primitive.
 */
export type TextVariant = keyof typeof textVariants;

/**
 * Keys for size tokens in `fontSizes`.
 */
export type FontSizeKey = keyof typeof fontSizes;

/**
 * Keys for weight tokens in `fontWeights`.
 */
export type FontWeightKey = keyof typeof fontWeights;
