// Retention presets for staged deletions before permanent cleanup runs.
// These values represent a safety window so users can recover mistakes.

// ── Retention policy ───────────────────────────────────────────────────────────

/**
 * Allowed retention durations (in days) exposed in settings and confirmation UI.
 */
export const RETENTION_OPTIONS = [7, 14, 30] as const;

/**
 * Default retention period (days) favoring safety over aggressive cleanup.
 */
export const DEFAULT_RETENTION = 30;
