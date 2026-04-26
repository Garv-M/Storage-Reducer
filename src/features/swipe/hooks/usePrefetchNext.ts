// Lightweight image prefetch hook for upcoming swipe cards.
// Warms cache for near-future assets to reduce visible decode/loading delays.

import { useEffect } from 'react';

import { Image } from 'expo-image';

import type { Asset } from '@/types/asset';

/**
 * Prefetches the next two asset URIs after the current index.
 */
export const usePrefetchNext = (assets: Asset[], currentIndex: number) => {
  useEffect(() => {
    // Keep prefetch window small to balance smoothness against network/memory usage.
    const next = assets.slice(currentIndex + 1, currentIndex + 3).map((asset) => asset.uri);
    if (next.length) {
      // Fire-and-forget; prefetch failures should not block swipe interactions.
      void Image.prefetch(next);
    }
  }, [assets, currentIndex]);
};