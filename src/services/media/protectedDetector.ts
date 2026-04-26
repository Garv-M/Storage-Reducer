// Protected detector applies auto-skip policy for sensitive/unavailable assets.
// It centralizes rules so swipe/session logic can stay policy-agnostic.

import type { Asset } from '@/types/asset';

// ── Types ──────────────────────────────────────────────────────────────────────

/**
 * User-configurable toggles that determine which assets are auto-skipped.
 */
export interface AutoSkipSettings {
  hidden: boolean;
  cloudOnly: boolean;
  shared: boolean;
}

// ── Policy Evaluation ──────────────────────────────────────────────────────────

/**
 * Returns true when an asset should be excluded from swipe decisions
 * based on the configured protection settings.
 */
export const shouldAutoSkip = (asset: Asset, settings: AutoSkipSettings): boolean => {
  // Order is intentionally straightforward and short-circuiting; first match wins.
  if (settings.hidden && asset.isHidden) return true;
  if (settings.cloudOnly && asset.isCloudOnly) return true;
  if (settings.shared && asset.isShared) return true;
  return false;
};
