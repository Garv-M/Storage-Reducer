// Asset type mapping translates Expo media records into app-normalized Asset data.
// It centralizes unit conversions and defaulting rules used across the app.

import type * as ExpoMediaLibrary from 'expo-media-library';

import type { Asset, AssetKind } from '@/types/asset';

// ── Mapping Helpers ────────────────────────────────────────────────────────────

const toAssetKind = (asset: ExpoMediaLibrary.Asset): AssetKind => {
  if (asset.mediaType === 'video') return 'video';
  return 'photo';
};

// ── Public Mapper ──────────────────────────────────────────────────────────────

/**
 * Converts an Expo asset into the app's Asset model.
 *
 * Expo timestamps/durations are seconds; app domain uses milliseconds, so values
 * are normalized here to keep the rest of the app unit-consistent.
 */
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
  // Filename fallback keeps display and export logic stable for malformed assets.
  filename: asset.filename ?? asset.id,
  kind: toAssetKind(asset),
  width: asset.width,
  height: asset.height,
  // fileSize is optional in Expo typings on some platforms/media sources.
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
