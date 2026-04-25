import { Platform } from 'react-native';

import type { Asset } from '@/types/asset';
import { getAssetInfo } from './MediaLibrary';

export const isCloudOnly = async (asset: Asset): Promise<boolean> => {
  if (Platform.OS !== 'ios') return false;

  const info = await getAssetInfo(asset.id);
  if (!info) return false;

  return info.localUri == null;
};
