import type { Asset } from '@/types/asset';

const BURST_WINDOW_MS = 1200;

const stemFromFilename = (filename: string) => filename.replace(/\.[^.]+$/, '').toLowerCase();

const isRawFilename = (filename: string) => /\.(dng|arw|cr2|nef|rw2)$/i.test(filename);
const isJpegFilename = (filename: string) => /\.(jpe?g)$/i.test(filename);

export const groupBursts = (assets: Asset[]) => {
  const sorted = [...assets].sort((a, b) => a.createdAt - b.createdAt) as Array<Asset & { burstId?: string }>;
  let burstIndex = 0;
  let i = 0;

  while (i < sorted.length) {
    const groupMembers: Array<Asset & { burstId?: string }> = [sorted[i]];
    let j = i + 1;

    while (j < sorted.length) {
      const previous = sorted[j - 1];
      const candidate = sorted[j];
      const closeInTime = candidate.createdAt - previous.createdAt <= BURST_WINDOW_MS;
      const sameBurstId = Boolean(previous.burstId && previous.burstId === candidate.burstId);

      if (!closeInTime && !sameBurstId) break;
      groupMembers.push(candidate);
      j += 1;
    }

    if (groupMembers.length > 1) {
      const groupId = `burst_${burstIndex += 1}`;
      const ids = groupMembers.map((member) => member.id);
      groupMembers.forEach((member) => {
        member.groupId = groupId;
        member.kind = 'burst';
        member.pairing = { ...(member.pairing ?? {}), groupAssetIds: ids };
      });
    }

    i = j;
  }

  return assets;
};

export const groupLivePhotos = (assets: Asset[]) => {
  const byStem = new Map<string, Asset[]>();

  assets.forEach((asset) => {
    const stem = stemFromFilename(asset.filename);
    const list = byStem.get(stem) ?? [];
    list.push(asset);
    byStem.set(stem, list);
  });

  byStem.forEach((items, stem) => {
    const still = items.find((item) => item.kind === 'photo');
    const motion = items.find((item) => item.kind === 'video' && (item.durationMs ?? 0) < 4000);

    if (!still || !motion) return;

    still.kind = 'livePhoto';
    still.groupId = `live_${stem}`;
    still.pairing = { ...(still.pairing ?? {}), motionUri: motion.uri };
  });

  return assets;
};

export const groupRawJpeg = (assets: Asset[]) => {
  const rawByStem = new Map<string, Asset>();
  const jpegByStem = new Map<string, Asset>();

  assets.forEach((asset) => {
    const stem = stemFromFilename(asset.filename);
    if (isRawFilename(asset.filename)) rawByStem.set(stem, asset);
    if (isJpegFilename(asset.filename)) jpegByStem.set(stem, asset);
  });

  rawByStem.forEach((rawAsset, stem) => {
    const jpegAsset = jpegByStem.get(stem);
    if (!jpegAsset) return;

    const groupId = `raw_${stem}`;
    rawAsset.kind = 'rawPair';
    jpegAsset.kind = 'rawPair';
    rawAsset.groupId = groupId;
    jpegAsset.groupId = groupId;
    rawAsset.pairing = { ...(rawAsset.pairing ?? {}), jpegId: jpegAsset.id };
    jpegAsset.pairing = { ...(jpegAsset.pairing ?? {}), rawId: rawAsset.id };
  });

  return assets;
};

export const applyGrouping = (assets: Asset[]) => {
  const grouped = assets.map((asset) => ({ ...asset }));
  groupBursts(grouped);
  groupLivePhotos(grouped);
  groupRawJpeg(grouped);
  return grouped;
};
