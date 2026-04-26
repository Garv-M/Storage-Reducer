// Swipe decision classifier used at gesture-end to map movement into domain actions.
// Combines distance and fling velocity so short, fast swipes still feel responsive.

import { SWIPE_THRESHOLD_RATIO, VELOCITY_THRESHOLD } from '@/constants/thresholds';
import type { Decision } from '@/types/decision';

/**
 * Converts pan translation/velocity into a swipe decision, or `null` if intent is too weak.
 */
export const classifySwipe = (
  tx: number,
  ty: number,
  vx: number,
  vy: number,
  width: number,
  height: number
): Decision | null => {
  // Scale thresholds by viewport so behavior is consistent across device sizes.
  const horizontalThreshold = width * SWIPE_THRESHOLD_RATIO;
  const verticalThreshold = height * SWIPE_THRESHOLD_RATIO;

  // Either distance OR velocity may qualify; velocity enables intentional flick gestures.
  const horizontalQualified = Math.abs(tx) > horizontalThreshold || Math.abs(vx) > VELOCITY_THRESHOLD;
  const verticalQualified = Math.abs(ty) > verticalThreshold || Math.abs(vy) > VELOCITY_THRESHOLD;

  if (!horizontalQualified && !verticalQualified) {
    // Below thresholds in both axes: treat as cancelled drag and snap card back.
    return null;
  }

  // Resolve diagonal swipes by dominant axis magnitude to avoid ambiguous outcomes.
  if (Math.abs(tx) >= Math.abs(ty)) {
    return tx > 0 ? 'KEEP' : 'DELETE_STAGED';
  }

  return ty < 0 ? 'FAVORITE' : 'SKIP_LATER';
};