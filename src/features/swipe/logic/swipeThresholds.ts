import { SWIPE_THRESHOLD_RATIO, VELOCITY_THRESHOLD } from '@/constants/thresholds';
import type { Decision } from '@/types/decision';

export const classifySwipe = (
  tx: number,
  ty: number,
  vx: number,
  vy: number,
  width: number,
  height: number
): Decision | null => {
  const horizontalThreshold = width * SWIPE_THRESHOLD_RATIO;
  const verticalThreshold = height * SWIPE_THRESHOLD_RATIO;

  const horizontalQualified = Math.abs(tx) > horizontalThreshold || Math.abs(vx) > VELOCITY_THRESHOLD;
  const verticalQualified = Math.abs(ty) > verticalThreshold || Math.abs(vy) > VELOCITY_THRESHOLD;

  if (!horizontalQualified && !verticalQualified) {
    return null;
  }

  if (Math.abs(tx) >= Math.abs(ty)) {
    return tx > 0 ? 'KEEP' : 'DELETE_STAGED';
  }

  return ty < 0 ? 'FAVORITE' : 'SKIP_LATER';
};
