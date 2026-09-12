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

export function seasonProgressQueryKey(tvShowId: string, seasonNumber: number) {
  return ['watch-history', 'tv', tvShowId, 'season', seasonNumber, 'progress'] as const;
}
