export type AssetId = string;

export type AssetKind = 'photo' | 'video' | 'livePhoto' | 'burst' | 'rawPair';

export interface Asset {
  id: AssetId;
  uri: string;
  filename: string;
  kind: AssetKind;
  width: number;
  height: number;
  bytes: number;
  createdAt: number;
  modifiedAt: number;
  durationMs?: number;
  albumIds: string[];
  isFavorite: boolean;
  isHidden: boolean;
  isCloudOnly: boolean;
  isShared: boolean;
  groupId?: string;
  pairing?: { rawId?: AssetId; jpegId?: AssetId };
}
