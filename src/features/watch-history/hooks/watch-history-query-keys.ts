import { DEFAULT_WATCH_HISTORY_PAGE_SIZE } from '../types';

export function movieWatchStatusQueryKey(movieId: string) {
  return ['watch-history', 'movie', movieId, 'me'] as const;
}

export function episodeWatchStatusQueryKey(episodeId: string) {
  return ['watch-history', 'episode', episodeId, 'me'] as const;
}

export function watchedMoviesQueryKey(page = 1, pageSize = DEFAULT_WATCH_HISTORY_PAGE_SIZE) {
  return ['watch-history', 'movies', page, pageSize] as const;
}

export function watchedEpisodesQueryKey(page = 1, pageSize = DEFAULT_WATCH_HISTORY_PAGE_SIZE) {
  return ['watch-history', 'episodes', page, pageSize] as const;
}

export function recentWatchHistoryInfiniteQueryKey(
  pageSize = DEFAULT_WATCH_HISTORY_PAGE_SIZE,
) {
  return ['watch-history', 'recent', pageSize] as const;
}

export function tvShowProgressQueryKey(tvShowId: string) {
  return ['watch-history', 'tv', tvShowId, 'progress'] as const;
}

/**
 * Light poster-card status (isFullyWatched + regular totals). Nested under the full progress key
 * on purpose: every existing invalidation of tvShowProgressQueryKey also refreshes it, while the
 * detail screen's exact-key reads and optimistic writes never see this smaller shape.
 */
export function tvShowCardWatchStatusQueryKey(tvShowId: string) {
  return [...tvShowProgressQueryKey(tvShowId), 'card'] as const;
}

export function seasonProgressQueryKey(tvShowId: string, seasonNumber: number) {
  return ['watch-history', 'tv', tvShowId, 'season', seasonNumber, 'progress'] as const;
}

export function seasonWatchedEpisodesQueryKey(tvShowId: string, seasonNumber: number) {
  return ['watch-history', 'tv', tvShowId, 'season', seasonNumber, 'watched-episodes'] as const;
}
