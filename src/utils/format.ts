// Formatting helpers for file sizes, dates, and small UI text fragments.
// These utilities keep display formatting consistent across screens.

// ── Byte formatting ────────────────────────────────────────────────────────────

/** Ordered binary units used for human-readable storage values. */
const BYTE_UNITS = ['B', 'KB', 'MB', 'GB', 'TB'] as const;

/**
 * Converts raw bytes into a compact human-readable string.
 * Uses base-1024 units to match OS-level storage reporting conventions.
 */
export const bytesToHuman = (bytes: number): string => {
  if (!Number.isFinite(bytes) || bytes <= 0) return '0 B';

  const power = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), BYTE_UNITS.length - 1);
  const value = bytes / 1024 ** power;
  // Show one decimal only for small non-byte units to balance precision and readability.
  const precision = power === 0 ? 0 : value < 10 ? 1 : 0;

  return `${value.toFixed(precision)} ${BYTE_UNITS[power]}`;
};

// ── Date formatting ────────────────────────────────────────────────────────────

/**
 * Formats a Unix timestamp (ms) using the device locale for familiar readability.
 */
export const dateFmt = (timestamp: number): string => {
  // Em dash keeps empty values visually distinct from real dates like epoch start.
  if (!timestamp) return '—';

  return new Date(timestamp).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

// ── Text helpers ───────────────────────────────────────────────────────────────

/**
 * Returns a simple English singular/plural label for count-based UI copy.
 */
export const pluralize = (count: number, noun: string): string =>
  `${count} ${noun}${count === 1 ? '' : 's'}`;
