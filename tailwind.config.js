/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,jsx,ts,tsx}', './src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  darkMode: 'class',
  theme: {
    extend: {
      // ── Brand + Gray colors ──────────────────────────────────────────────
      colors: {
        // Brand primitives
        blue100: '#0053e2',
        spark100: '#ffc220',
        red100: '#ea1100',
        green100: '#2a8703',
        spark140: '#995213',
        spark10: '#fff8e1',

        // Gray scale
        gray5: '#f8f9fa',
        gray10: '#f1f3f5',
        gray50: '#d7dde4',
        gray100: '#a2afc0',
        gray160: '#2e3a46',
        gray180: '#1b242d',

        // Semantic light mode tokens
        'light-background': '#ffffff',
        'light-surface': '#f8f9fa',
        'light-surface-elevated': '#ffffff',
        'light-text': '#1b242d',
        'light-text-secondary': '#2e3a46',
        'light-text-muted': '#a2afc0',
        'light-border': '#d7dde4',
        'light-border-subtle': '#f1f3f5',

        // Semantic dark mode tokens
        'dark-background': '#0f1419',
        'dark-surface': '#1b242d',
        'dark-surface-elevated': '#2e3a46',
        'dark-text': '#f8f9fa',
        'dark-text-secondary': '#d7dde4',
        'dark-text-muted': '#a2afc0',
        'dark-border': '#2e3a46',
        'dark-border-subtle': '#1b242d',
      },

      // ── Font families ────────────────────────────────────────────────────
      fontFamily: {
        sans: ['PlusJakartaSans_400Regular', 'System'],
        'sans-medium': ['PlusJakartaSans_500Medium', 'System'],
        'sans-semibold': ['PlusJakartaSans_600SemiBold', 'System'],
        'sans-bold': ['PlusJakartaSans_700Bold', 'System'],
      },

      // ── Extended spacing (8dp rhythm) ────────────────────────────────────
      spacing: {
        '13': '52px',
        '15': '60px',
        '18': '72px',
        '22': '88px',
        '26': '104px',
        '30': '120px',
        '34': '136px',
        '48': '192px',
        '56': '224px',
        '64': '256px',
        '72': '288px',
      },

      // ── Border radius ────────────────────────────────────────────────────
      borderRadius: {
        sm: '8px',
        md: '12px',
        lg: '16px',
        xl: '20px',
        '2xl': '24px',
        '3xl': '32px',
        full: '9999px',
      },

      // ── Font sizes ───────────────────────────────────────────────────────
      fontSize: {
        xxs: '10px',
        xs: '12px',
        sm: '14px',
        md: '16px',
        base: '16px',
        lg: '18px',
        xl: '22px',
        '2xl': '28px',
        '3xl': '34px',
      },

      // ── Shadow tokens ────────────────────────────────────────────────────
      boxShadow: {
        sm: '0 1px 3px rgba(27,36,45,0.08), 0 1px 2px rgba(27,36,45,0.06)',
        md: '0 4px 6px rgba(27,36,45,0.08), 0 2px 4px rgba(27,36,45,0.06)',
        lg: '0 10px 15px rgba(27,36,45,0.10), 0 4px 6px rgba(27,36,45,0.06)',
      },
    },
  },
  plugins: [],
};
