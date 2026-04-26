// UI Theme Barrel
// Centralized exports for design tokens used by primitives and features.
// Keeping a single entry point reduces import churn and helps preserve
// consistent token usage across the app.

// ── Color Tokens ──────────────────────────────────────────────────────────────
export { colors } from './colors';
export type { ColorToken } from './colors';

// ── Typography Tokens ─────────────────────────────────────────────────────────
export {
  fontSizes,
  fontWeights,
  fontFamilies,
  lineHeights,
  textVariants,
} from './typography';
export type { FontSizeKey, FontWeightKey, TextVariant } from './typography';
