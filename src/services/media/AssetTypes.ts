import type * as ExpoMediaLibrary from 'expo-media-library';

import type { Asset, AssetKind } from '@/types/asset';

const toAssetKind = (asset: ExpoMediaLibrary.Asset): AssetKind => {
  if (asset.mediaType === 'video') return 'video';
  return 'photo';
};

export const toAppAsset = (
  asset: ExpoMediaLibrary.Asset,
  extras?: {
    albumIds?: string[];
    isFavorite?: boolean;
    isHidden?: boolean;
    isCloudOnly?: boolean;
    isShared?: boolean;
  }
): Asset => ({
  id: asset.id,
  uri: asset.uri,
  filename: asset.filename ?? asset.id,
  kind: toAssetKind(asset),
  width: asset.width,
  height: asset.height,
  bytes: (asset as { fileSize?: number }).fileSize ?? 0,
  createdAt: (asset.creationTime ?? Date.now()) * 1000,
  modifiedAt: (asset.modificationTime ?? Date.now()) * 1000,
  durationMs: asset.duration ? asset.duration * 1000 : undefined,
  albumIds: extras?.albumIds ?? [],
  isFavorite: extras?.isFavorite ?? false,
  isHidden: extras?.isHidden ?? false,
  isCloudOnly: extras?.isCloudOnly ?? false,
  isShared: extras?.isShared ?? false,
});
