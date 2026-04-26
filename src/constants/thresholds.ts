// Shared interaction thresholds for swipe gestures and undo behavior.
// Centralizing these constants keeps gesture tuning consistent across components.

// ── Swipe gesture thresholds ───────────────────────────────────────────────────

/**
 * Fraction of card width required to count as an intentional swipe action.
 */
export const SWIPE_THRESHOLD_RATIO = 0.3;

/**
 * Minimum horizontal velocity (px/s) that can trigger action even with shorter travel.
 */
export const VELOCITY_THRESHOLD = 800;

/**
 * Multiplier used to convert horizontal drag distance into card tilt (degrees).
 */
export const ROTATION_FACTOR = 12;

// ── Session ergonomics ─────────────────────────────────────────────────────────

/**
 * Maximum number of decisions retained for undo to bound memory and UI complexity.
 */
export const UNDO_STACK_CAP = 20;
