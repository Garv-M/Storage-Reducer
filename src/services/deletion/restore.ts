import { useSessionStore } from '@/stores/sessionStore';
import { useTrashStore } from '@/stores/trashStore';

export const restoreFromTrash = (assetIds: string[]) => {
  if (!assetIds.length) return;

  const trashStore = useTrashStore.getState();
  trashStore.removeConfirmed(assetIds);
  trashStore.removeFromFailed(assetIds);

  const activeSessionId = useSessionStore.getState().activeSessionId;
  if (!activeSessionId) return;

  const { recordDecision } = useSessionStore.getState();
  assetIds.forEach((assetId) => {
    recordDecision(assetId, 'KEEP');
  });
};

export const bulkRestore = (assetIds: string[]) => {
  restoreFromTrash(assetIds);
};
