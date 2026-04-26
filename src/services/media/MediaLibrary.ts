// Media library service wraps Expo APIs behind app-safe contracts and logging.
// It returns normalized paging data and centralizes error strategy per operation.

import * as ExpoMediaLibrary from 'expo-media-library';

import { createLogger } from '@/utils/log';

const logger = createLogger('MediaLibraryService');

// ── Types ──────────────────────────────────────────────────────────────────────

/**
 * App-facing page shape for media pagination.
 */
export interface AssetPage {
  assets: ExpoMediaLibrary.Asset[];
  endCursor: string | null;
  hasNextPage: boolean;
}

// ── Permissions ────────────────────────────────────────────────────────────────

/**
 * Requests photo/video library permissions.
 */
export const requestPermissions = async () => ExpoMediaLibrary.requestPermissionsAsync(false, ['photo', 'video']);

// ── Asset Queries ──────────────────────────────────────────────────────────────

/**
 * Fetches a page of assets sorted by creation time.
 *
 * On failure, returns an empty non-throwing page so pagination callers can
 * degrade gracefully without crashing UI flows.
 */
export const getAssets = async (cursor?: string | null, pageSize = 200): Promise<AssetPage> => {
  try {
    const page = await ExpoMediaLibrary.getAssetsAsync({
      first: pageSize,
      after: cursor ?? undefined,
      mediaType: ['photo', 'video'],
      sortBy: [ExpoMediaLibrary.SortBy.creationTime],
    });

    return {
      assets: page.assets,
      endCursor: page.endCursor ?? null,
      hasNextPage: page.hasNextPage,
    };
  } catch (error) {
    logger.error('Failed to fetch assets', error);
    return {
      assets: [],
      endCursor: cursor ?? null,
      hasNextPage: false,
    };
  }
};

/**
 * Retrieves detailed metadata for a single asset.
 *
 * Returns null on failure because metadata is optional enrichment, not a hard
 * requirement for baseline swipe/deletion flows.
 */
export const getAssetInfo = async (id: string) => {
  try {
    return await ExpoMediaLibrary.getAssetInfoAsync(id);
  } catch (error) {
    logger.error(`Failed to fetch asset info for ${id}`, error);
    return null;
  }
};

// ── Mutations ──────────────────────────────────────────────────────────────────

/**
 * Deletes one or more assets from the native library.
 *
 * Unlike read APIs, deletion rethrows after logging so callers can apply retry,
 * partial-failure handling, and user messaging policies.
 */
export const deleteAssetsAsync = async (ids: string[]) => {
  try {
    return await ExpoMediaLibrary.deleteAssetsAsync(ids);
  } catch (error) {
    logger.error('Failed to delete assets', error);
    throw error;
  }
};
