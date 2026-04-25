import type { Asset } from '@/types/asset';

export interface AutoSkipSettings {
  hidden: boolean;
  cloudOnly: boolean;
  shared: boolean;
}

export const shouldAutoSkip = (asset: Asset, settings: AutoSkipSettings): boolean => {
  if (settings.hidden && asset.isHidden) return true;
  if (settings.cloudOnly && asset.isCloudOnly) return true;
  if (settings.shared && asset.isShared) return true;
  return false;
};
