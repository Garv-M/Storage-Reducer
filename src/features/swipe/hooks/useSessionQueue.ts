import { useCallback, useEffect, useMemo, useState } from 'react';

import { applyGrouping } from '@/services/media/grouping';
import { getAssets } from '@/services/media/MediaLibrary';
import { toAppAsset } from '@/services/media/AssetTypes';
import { isCloudOnly } from '@/services/media/cloudDetector';
import { shouldAutoSkip } from '@/services/media/protectedDetector';
import { useSessionStore } from '@/stores/sessionStore';
import { useSettingsStore } from '@/stores/settingsStore';
import type { Asset } from '@/types/asset';

const PAGE_SIZE = 200;
const LOAD_MORE_REMAINING_THRESHOLD = 40;

export const useSessionQueue = (sessionId: string, enabled = true) => {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [hasNextPage, setHasNextPage] = useState(true);
  const [skippedProtectedCount, setSkippedProtectedCount] = useState(0);

  const session = useSessionStore((state) => state.sessions[sessionId]);
  const appendQueueIds = useSessionStore((state) => state.appendQueueIds);
  const setCursor = useSessionStore((state) => state.setCursor);
  const autoSkip = useSettingsStore((state) => state.autoSkip);

  const loadPage = useCallback(async () => {
    if (!enabled || !session || isLoading || !hasNextPage) return;

    setIsLoading(true);
    const page = await getAssets(session.cursor ?? null, PAGE_SIZE);

    if ((session.queueIds?.length ?? 0) === 0) {
      appendQueueIds(
        sessionId,
        page.assets.map((asset) => asset.id),
        page.endCursor
      );
    }
    setCursor(sessionId, page.endCursor);
    setHasNextPage(page.hasNextPage);

    const nextMapped = await Promise.all(
      page.assets.map(async (asset) => {
        const cloudOnly = await isCloudOnly(
          toAppAsset(asset, {
            albumIds: (asset as { albumId?: string }).albumId ? [(asset as { albumId?: string }).albumId as string] : [],
          })
        );

        return {
          ...toAppAsset(asset, {
            albumIds: (asset as { albumId?: string }).albumId ? [(asset as { albumId?: string }).albumId as string] : [],
            isCloudOnly: cloudOnly,
            isShared: (asset as { isShared?: boolean }).isShared ?? false,
            isHidden: (asset as { isHidden?: boolean }).isHidden ?? false,
            isFavorite: (asset as { isFavorite?: boolean }).isFavorite ?? false,
          }),
          burstId: (asset as { burstId?: string }).burstId,
        };
      })
    );

    const grouped = applyGrouping(nextMapped);

    setAssets((prev) => {
      const seen = new Set(prev.map((asset) => asset.id));
      const sessionQueueFilter = session.queueIds.length ? new Set(session.queueIds) : null;
      const filteredForSession = sessionQueueFilter ? grouped.filter((asset) => sessionQueueFilter.has(asset.id)) : grouped;
      const skipped = filteredForSession.filter((item) => shouldAutoSkip(item, autoSkip));
      const kept = filteredForSession.filter((item) => !shouldAutoSkip(item, autoSkip));

      if (skipped.length > 0) {
        setSkippedProtectedCount((count) => count + skipped.length);
      }

      return [...prev, ...kept.filter((item) => !seen.has(item.id))];
    });

    setIsLoading(false);
  }, [appendQueueIds, autoSkip, enabled, hasNextPage, isLoading, session, sessionId, setCursor]);

  useEffect(() => {
    if (!enabled || !session) return;
    if (assets.length > 0) return;
    void loadPage();
  }, [assets.length, enabled, loadPage, session]);

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
    skippedProtectedCount,
    clearSkippedProtectedCount: () => setSkippedProtectedCount(0),
  };
};
