import { useEffect } from 'react';

import { Image } from 'expo-image';

import type { Asset } from '@/types/asset';

export const usePrefetchNext = (assets: Asset[], currentIndex: number) => {
  useEffect(() => {
    const next = assets.slice(currentIndex + 1, currentIndex + 3).map((asset) => asset.uri);
    if (next.length) {
      void Image.prefetch(next);
    }
  }, [assets, currentIndex]);
};
