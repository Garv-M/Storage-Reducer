import type { AssetId } from '@/types/asset';

export type Decision = 'KEEP' | 'DELETE_STAGED' | 'FAVORITE' | 'SKIP_LATER';

export interface DecisionRecord {
  assetId: AssetId;
  decision: Decision;
  at: number;
  sessionId: string;
}
