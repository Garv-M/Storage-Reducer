import { useSettingsStore } from '@/stores/settingsStore';
import type { Asset } from '@/types/asset';

export interface AutoSkipSettings {
  favorites: boolean;
  hidden: boolean;
  cloudOnly: boolean;
  shared: boolean;
}

export const shouldAutoSkip = (asset: Asset, settings: AutoSkipSettings): boolean => {
  if (settings.favorites && asset.isFavorite) return true;
  if (settings.hidden && asset.isHidden) return true;
  if (settings.cloudOnly && asset.isCloudOnly) return true;
  if (settings.shared && asset.isShared) return true;
  return false;
};

export const shouldAutoSkipProtected = (asset: Asset) => {
  const autoSkip = useSettingsStore.getState().autoSkip;
  return shouldAutoSkip(asset, autoSkip);
};
