import * as ExpoMediaLibrary from 'expo-media-library';

import { createLogger } from '@/utils/log';

const logger = createLogger('MediaLibraryService');

export interface AssetPage {
  assets: ExpoMediaLibrary.Asset[];
  endCursor: string | null;
  hasNextPage: boolean;
}

export const requestPermissions = async () => ExpoMediaLibrary.requestPermissionsAsync(false, ['photo', 'video']);

export const getPermissions = async () => ExpoMediaLibrary.getPermissionsAsync(false, ['photo', 'video']);

export const getAssets = async (
  cursor?: string | null,
  pageSize = 200,
  options?: { createdAfter?: number }
): Promise<AssetPage> => {
  try {
    const page = await ExpoMediaLibrary.getAssetsAsync({
      first: pageSize,
      after: cursor ?? undefined,
      mediaType: ['photo', 'video'],
      sortBy: [ExpoMediaLibrary.SortBy.creationTime],
      createdAfter: options?.createdAfter,
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

export const getAssetInfo = async (id: string) => {
  try {
    return await ExpoMediaLibrary.getAssetInfoAsync(id);
  } catch (error) {
    logger.error(`Failed to fetch asset info for ${id}`, error);
    return null;
  }
};

export const getAssetsCreatedAfter = async (createdAfter: number, pageSize = 200) => {
  return getAssets(null, pageSize, { createdAfter });
};

export const deleteAssetsAsync = async (ids: string[]) => {
  try {
    return await ExpoMediaLibrary.deleteAssetsAsync(ids);
  } catch (error) {
    logger.error('Failed to delete assets', error);
    throw error;
  }
};
