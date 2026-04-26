// UI Theme: Color Tokens
// Defines the Walmart-aligned color foundation for all UI primitives.
// This file intentionally separates raw palette tokens (brand + grayscale)
// from semantic tokens (light/dark meaning-based usage) so components can
// style by intent (e.g., `text`, `border`) instead of hard-coded hex values.
// This keeps contrast and theming decisions centralized and auditable.

// ── Color Token Registry ──────────────────────────────────────────────────────
/**
 * Canonical color tokens for the design system.
 *
 * WHY this structure:
 * - Brand primitives preserve exact Walmart token values (primary at level 100).
 * - Gray scale follows the 5 → 180 progression for predictable light/dark steps.
 * - Semantic `light` and `dark` groups keep component code mode-agnostic.
 * - Contrast-sensitive text/surface pairings are chosen to support WCAG 2.2 AA
 *   targets (4.5:1 for text, 3:1 for non-text UI where applicable).
 */
export const colors = {
  // ── Brand primitives ─────────────────────────────────────────────────────
  // Level-100 brand anchors used for primary actions, accents, and status.
  blue100: '#0053e2',
  spark100: '#ffc220',
  red100: '#ea1100',
  green100: '#2a8703',
  spark140: '#995213',
  spark10: '#fff8e1',

  // ── Gray scale ───────────────────────────────────────────────────────────
  // Ordered from lightest (5) to darkest (180) for predictable layering.
  gray5: '#f8f9fa',
  gray10: '#f1f3f5',
  gray50: '#d7dde4',
  gray100: '#a2afc0',
  gray160: '#2e3a46',
  gray180: '#1b242d',
  white: '#ffffff',
  black: '#000000',

  // ── Semantic — light mode ────────────────────────────────────────────────
  // Semantic names let primitives request intent-based colors instead of hex.
  light: {
    background: '#ffffff',
    surface: '#f8f9fa',
    surfaceElevated: '#ffffff',
    text: '#1b242d',
    textSecondary: '#2e3a46',
    textMuted: '#a2afc0',
    border: '#d7dde4',
    borderSubtle: '#f1f3f5',
    // Overlay alpha is tuned to dim content while keeping context visible.
    overlay: 'rgba(27,36,45,0.5)',
  },

  // ── Semantic — dark mode ─────────────────────────────────────────────────
  // Dark semantic values are not direct inverses; they are tuned for legibility
  // and hierarchy under low-luminance backgrounds.
  dark: {
    background: '#0f1419',
    surface: '#1b242d',
    surfaceElevated: '#2e3a46',
    text: '#f8f9fa',
    textSecondary: '#d7dde4',
    textMuted: '#a2afc0',
    border: '#2e3a46',
    borderSubtle: '#1b242d',
    overlay: 'rgba(0,0,0,0.6)',
  },
} as const;

/**
 * Top-level color token keys available from the `colors` object.
 */
export type ColorToken = keyof typeof colors;
