export const colors = {
  blue100: '#0053e2',
  spark100: '#ffc220',
  red100: '#ea1100',
  green100: '#2a8703',
  spark140: '#995213',
  spark10: '#fff8e1',
  gray5: '#f8f9fa',
  gray10: '#f1f3f5',
  gray50: '#d7dde4',
  gray100: '#a2afc0',
  gray160: '#2e3a46',
  gray180: '#1b242d',
  white: '#ffffff',
  black: '#000000',
} as const;

export type ColorToken = keyof typeof colors;
