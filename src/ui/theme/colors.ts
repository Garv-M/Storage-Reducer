export const colors = {
  // ── Brand primitives ─────────────────────────────────────────────────────
  blue100: '#0053e2',
  spark100: '#ffc220',
  red100: '#ea1100',
  green100: '#2a8703',
  spark140: '#995213',
  spark10: '#fff8e1',

  // ── Gray scale ───────────────────────────────────────────────────────────
  gray5: '#f8f9fa',
  gray10: '#f1f3f5',
  gray50: '#d7dde4',
  gray100: '#a2afc0',
  gray160: '#2e3a46',
  gray180: '#1b242d',
  white: '#ffffff',
  black: '#000000',

  // ── Semantic — light mode ────────────────────────────────────────────────
  light: {
    background: '#ffffff',
    surface: '#f8f9fa',
    surfaceElevated: '#ffffff',
    text: '#1b242d',
    textSecondary: '#2e3a46',
    textMuted: '#a2afc0',
    border: '#d7dde4',
    borderSubtle: '#f1f3f5',
    overlay: 'rgba(27,36,45,0.5)',
  },

  // ── Semantic — dark mode ─────────────────────────────────────────────────
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

export type ColorToken = keyof typeof colors;
