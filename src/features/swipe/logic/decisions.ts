import type { Decision } from '@/types/decision';
import { colors } from '@/ui/theme/colors';

export type { Decision };

export const DECISION_COLORS: Record<Decision, string> = {
  KEEP: colors.green100,
  DELETE_STAGED: colors.red100,
  FAVORITE: colors.spark100,
  SKIP_LATER: colors.blue100,
};

export const DECISION_LABELS: Record<Decision, string> = {
  KEEP: 'KEEP',
  DELETE_STAGED: 'DELETE',
  FAVORITE: 'FAVORITE',
  SKIP_LATER: 'SKIP',
};
