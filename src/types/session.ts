import type { AssetId } from '@/types/asset';
import type { DecisionRecord } from '@/types/decision';

export interface Session {
  id: string;
  createdAt: number;
  filterId?: string;
  cursor?: string | null;
  queueIds: AssetId[];
  decisions: DecisionRecord[];
  undoStack: DecisionRecord[];
  freedBytesEstimated: number;
  incognito: boolean;
  completedAt?: number;
}
