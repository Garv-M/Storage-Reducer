// Pager streams media IDs in chunks so large libraries can be processed gradually.
// It provides cursor-based continuation and bounded work per invocation.

import { getAssets } from '@/services/media/MediaLibrary';
import type { Result } from '@/utils/result';
import { err, ok } from '@/utils/result';

// ── Types ──────────────────────────────────────────────────────────────────────

/**
 * Configuration for chunked asset-id streaming.
 */
export interface StreamAssetIdsOptions {
  startCursor?: string | null;
  chunkSize?: number;
  maxChunks?: number;
  onChunk: (ids: string[], cursor: string | null, hasNextPage: boolean) => Promise<void> | void;
}

// ── Streaming ──────────────────────────────────────────────────────────────────

/**
 * Streams asset IDs page-by-page and invokes `onChunk` for each page.
 *
 * Returns a Result instead of throwing so callers can compose this with other
 * functional-style workflows and user-facing error messaging.
 */
export const streamAssetIds = async (
  options: StreamAssetIdsOptions
): Promise<Result<{ cursor: string | null; chunksLoaded: number }, string>> => {
  const chunkSize = options.chunkSize ?? 200;
  const maxChunks = options.maxChunks ?? 1;

  let cursor = options.startCursor ?? null;
  let hasNextPage = true;
  let chunksLoaded = 0;

  try {
    while (hasNextPage && chunksLoaded < maxChunks) {
      const page = await getAssets(cursor, chunkSize);
      const ids = page.assets.map((asset) => asset.id);

      await options.onChunk(ids, page.endCursor, page.hasNextPage);

      chunksLoaded += 1;
      cursor = page.endCursor;
      hasNextPage = page.hasNextPage;

      // Defensive break: prevents infinite looping if provider reports next page
      // but repeatedly returns no assets for a cursor.
      if (ids.length === 0) {
        break;
      }
    }

    return ok({ cursor, chunksLoaded });
  } catch {
    return err('Unable to stream asset IDs');
  }
};
