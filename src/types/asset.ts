// Defines the canonical media asset shape used across swipe, staging, and deletion flows.
// This model preserves enough metadata to enforce safety rules before final deletion.

// ── Asset identity & shape ─────────────────────────────────────────────────────

/** Stable identifier returned by the device media library for an asset. */
export type AssetId = string;

/**
 * Normalized media categories the app supports during review.
 * `rawPair` represents RAW+JPEG captures that should be treated as a linked unit.
 */
export type AssetKind = 'photo' | 'video' | 'livePhoto' | 'burst' | 'rawPair';

/**
 * Device media metadata required for rendering, filtering, and safe cleanup decisions.
 */
export interface Asset {
  /** Unique media-library identifier used as the primary key in app state. */
  id: AssetId;
  /** Local URI used for previewing and zooming in the swipe UI. */
  uri: string;
  /** Human-readable filename shown in detail sheets and diagnostics. */
  filename: string;
  /** Normalized media kind used by filtering and business rules. */
  kind: AssetKind;
  /** Pixel width for layout and orientation-aware rendering decisions. */
  width: number;
  /** Pixel height for layout and orientation-aware rendering decisions. */
  height: number;
  /** Byte size used for storage-savings estimation in session stats. */
  bytes: number;
  /** Unix timestamp (ms) when the asset was originally created. */
  createdAt: number;
  /** Unix timestamp (ms) for last modification, useful for tie-breaking recency. */
  modifiedAt: number;
  /** Video duration in milliseconds; omitted for non-video assets. */
  durationMs?: number;
  /** Album memberships needed to preserve context when restoring or reviewing. */
  albumIds: string[];
  /** Favorite assets may receive extra protection in decision flows. */
  isFavorite: boolean;
  /** Hidden assets are tracked so UI can respect user privacy expectations. */
  isHidden: boolean;
  /** True when the full asset is remote-only and may require download on access. */
  isCloudOnly: boolean;
  /** Shared-library signal used by permission/safety checks before deletion. */
  isShared: boolean;
  /** Optional burst/live grouping key for related frames. */
  groupId?: string;
  /** Linked IDs for RAW/JPEG companions so cleanup can keep pairs consistent. */
  pairing?: { rawId?: AssetId; jpegId?: AssetId };
}
