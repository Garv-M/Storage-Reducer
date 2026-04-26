// Defines user review outcomes and their audit trail records.
// Decision records are immutable events used for undo and analytics.

import type { AssetId } from '@/types/asset';

// ── Decision domain ────────────────────────────────────────────────────────────

/**
 * Allowed outcomes from the swipe/review flow.
 * Values are persisted as explicit literals to keep storage and migrations stable.
 */
export type Decision = 'KEEP' | 'DELETE_STAGED' | 'FAVORITE' | 'SKIP_LATER';

/**
 * Immutable decision event tied to a session and timestamp.
 */
export interface DecisionRecord {
  /** Asset the user acted on. */
  assetId: AssetId;
  /** Chosen review outcome at the time of interaction. */
  decision: Decision;
  /** Unix timestamp (ms) when the decision was made. */
  at: number;
  /** Session scope for replay, undo, and crash recovery boundaries. */
  sessionId: string;
}
