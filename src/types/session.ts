// Describes the in-progress or completed swipe session state container.
// Sessions isolate queue order, decisions, and undo history for safe recovery.

import type { AssetId } from '@/types/asset';
import type { DecisionRecord } from '@/types/decision';

// ── Session model ──────────────────────────────────────────────────────────────

/**
 * Review session snapshot persisted between app launches.
 */
export interface Session {
  /** Unique session identifier used for routing and persistence keys. */
  id: string;
  /** Unix timestamp (ms) marking when this session started. */
  createdAt: number;
  /** Optional filter preset applied when queueIds were generated. */
  filterId?: string;
  /** Pagination cursor for continuing asset fetches without duplicates. */
  cursor?: string | null;
  /** Ordered queue of asset IDs to preserve deterministic swipe progression. */
  queueIds: AssetId[];
  /** Append-only list of actions taken during this session. */
  decisions: DecisionRecord[];
  /** LIFO stack of reversible actions, capped elsewhere for memory safety. */
  undoStack: DecisionRecord[];
  /** Running estimate of storage reclaimed if staged deletions are confirmed. */
  freedBytesEstimated: number;
  /** Privacy mode flag; when true, session details should avoid long-term traces. */
  incognito: boolean;
  /** Unix timestamp (ms) when user finished or exited completion flow. */
  completedAt?: number;
}
