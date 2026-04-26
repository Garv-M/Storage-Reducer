// Cloud detector identifies assets not present locally on device storage.
// Current implementation is iOS-only because localUri semantics differ by OS.

import { Platform } from 'react-native';

import type { Asset } from '@/types/asset';
import { getAssetInfo } from './MediaLibrary';

// ── Cloud Detection ────────────────────────────────────────────────────────────

/**
 * Returns true when an asset appears to be cloud-only (not downloaded locally).
 */
export const isCloudOnly = async (asset: Asset): Promise<boolean> => {
  // Expo's asset info signal (`localUri`) is reliable for this check on iOS.
  if (Platform.OS !== 'ios') return false;

  const info = await getAssetInfo(asset.id);
  if (!info) return false;

  return info.localUri == null;
};
