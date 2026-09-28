import type { QueryClient } from '@tanstack/react-query';
import { getLibraryActionStatus } from '../api/library-actions-api';
import type { LibraryActionMediaType, LibraryActionStatusResponse } from '../types';
import { seedDetailActionCachesFromLibraryActions } from './seed-detail-action-caches';

/**
 * Loads the batch library-action payload and writes per-icon caches before the
 * batch query notifies observers. Seeding inside the query function keeps the
 * first successful render from firing favorite, watchlist, follow, notify, and
 * watched status requests.
 */
export async function fetchAndSeedLibraryActionStatus(
  queryClient: QueryClient,
  mediaType: LibraryActionMediaType,
  contentId: string,
  signal?: AbortSignal,
  episodeId?: string,
): Promise<LibraryActionStatusResponse> {
  const fetchStartedAt = Date.now();
  const actions = episodeId
    ? await getLibraryActionStatus(mediaType, contentId, signal, episodeId)
    : await getLibraryActionStatus(mediaType, contentId, signal);
  seedDetailActionCachesFromLibraryActions(
    queryClient,
    mediaType,
    contentId,
    actions,
    fetchStartedAt,
  );
  return actions;
}
