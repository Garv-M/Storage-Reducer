// ── Font sizes (sp / pt) ─────────────────────────────────────────────────────
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

// ── Font weights ─────────────────────────────────────────────────────────────
export const fontWeights = {
  regular: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
} as const;

// ── Line-height presets (unitless ratio-to-font-size, converted to absolute) ─
// Used as pixel values in React Native
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

// ── Font families (loaded via expo-google-fonts) ──────────────────────────────
export const fontFamilies = {
  regular: 'PlusJakartaSans_400Regular',
  medium: 'PlusJakartaSans_500Medium',
  semibold: 'PlusJakartaSans_600SemiBold',
  bold: 'PlusJakartaSans_700Bold',
} as const;

// ── Semantic text variant map ─────────────────────────────────────────────────
export const textVariants = {
  hero: { size: fontSizes.hero, lineHeight: lineHeights.tight.hero, weight: fontWeights.bold },
  title: { size: fontSizes.xxl, lineHeight: lineHeights.tight.xxl, weight: fontWeights.bold },
  heading: { size: fontSizes.xl, lineHeight: lineHeights.snug.xl, weight: fontWeights.semibold },
  body: { size: fontSizes.md, lineHeight: lineHeights.normal.md, weight: fontWeights.regular },
  caption: { size: fontSizes.sm, lineHeight: lineHeights.normal.sm, weight: fontWeights.regular },
  label: { size: fontSizes.xs, lineHeight: lineHeights.tight.xs, weight: fontWeights.medium },
} as const;

export type TextVariant = keyof typeof textVariants;
export type FontSizeKey = keyof typeof fontSizes;
export type FontWeightKey = keyof typeof fontWeights;
