// Shared swipe decision presentation metadata.
// Keeps labels/colors centralized so overlay and badges remain consistent.

import type { Decision } from '@/types/decision';
import { colors } from '@/ui/theme/colors';

export type { Decision };

/**
 * Brand-aligned color for each decision shown in swipe overlays and status UI.
 */
export const DECISION_COLORS: Record<Decision, string> = {
  KEEP: colors.green100,
  DELETE_STAGED: colors.red100,
  FAVORITE: colors.spark100,
  SKIP_LATER: colors.blue100,
};

/**
 * Short, high-contrast labels optimized for at-a-glance feedback while swiping.
 */
export const DECISION_LABELS: Record<Decision, string> = {
  KEEP: 'KEEP',
  DELETE_STAGED: 'DELETE',
  FAVORITE: 'FAVORITE',
  SKIP_LATER: 'SKIP',
};