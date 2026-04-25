import { useCallback, useEffect, useMemo, useState } from 'react';

import { getAssets } from '@/services/media/MediaLibrary';
import { toAppAsset } from '@/services/media/AssetTypes';
import { useSessionStore } from '@/stores/sessionStore';
import type { Asset } from '@/types/asset';

const PAGE_SIZE = 200;
const LOAD_MORE_REMAINING_THRESHOLD = 40;

export const useSessionQueue = (sessionId: string) => {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [hasNextPage, setHasNextPage] = useState(true);

  const session = useSessionStore((state) => state.sessions[sessionId]);
  const appendQueueIds = useSessionStore((state) => state.appendQueueIds);
  const setCursor = useSessionStore((state) => state.setCursor);

  const loadPage = useCallback(async () => {
    if (!session || isLoading || !hasNextPage) return;

    setIsLoading(true);
    const page = await getAssets(session.cursor ?? null, PAGE_SIZE);

    appendQueueIds(
      sessionId,
      page.assets.map((asset) => asset.id),
      page.endCursor
    );
    setCursor(sessionId, page.endCursor);
    setHasNextPage(page.hasNextPage);

    setAssets((prev) => {
      const seen = new Set(prev.map((asset) => asset.id));
      const next = page.assets.map((asset) => toAppAsset(asset));
      return [...prev, ...next.filter((item) => !seen.has(item.id))];
    });

    setIsLoading(false);
  }, [appendQueueIds, hasNextPage, isLoading, session, sessionId, setCursor]);

  useEffect(() => {
    if (!session) return;
    if (assets.length > 0) return;
    void loadPage();
  }, [assets.length, loadPage, session]);

  const ensureAhead = useCallback(
    async (index: number) => {
      if (assets.length - index <= LOAD_MORE_REMAINING_THRESHOLD && hasNextPage) {
        await loadPage();
      }
    },
    [assets.length, hasNextPage, loadPage]
  );

  const visibleAssets = useMemo(() => assets.slice(currentIndex, currentIndex + 3), [assets, currentIndex]);

  return {
    assets,
    visibleAssets,
    currentIndex,
    setCurrentIndex,
    ensureAhead,
    isLoading,
    hasNextPage,
    totalCount: assets.length,
  };
};
