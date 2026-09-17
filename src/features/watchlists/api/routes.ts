function encodePathSegment(value: string): string {
  return encodeURIComponent(value);
}

export function buildWatchlistsPath(): string {
  return '/api/watchlists';
}

export function buildWatchlistMembershipPath(
  mediaType: 'movie' | 'tv',
  contentId: string,
): string {
  const params = new URLSearchParams({
    mediaType,
    contentId,
  });

  return `/api/watchlists/membership?${params.toString()}`;
}

export function buildWatchlistPath(watchlistId: string): string {
  return `/api/watchlists/${encodePathSegment(watchlistId)}`;
}

export function buildWatchlistItemsPath(
  watchlistId: string,
  page = 1,
  pageSize = 20,
  mediaType: string = 'all',
  sort: string = 'recentlyAdded',
): string {
  const params = new URLSearchParams({
    mediaType,
    sort,
    page: String(page),
    pageSize: String(pageSize),
  });

  return `/api/watchlists/${encodePathSegment(watchlistId)}/items?${params.toString()}`;
}

export function buildAddMovieToWatchlistPath(
  watchlistId: string,
  movieId: string,
): string {
  return `/api/watchlists/${encodePathSegment(watchlistId)}/movies/${encodePathSegment(movieId)}`;
}

export function buildRemoveMovieFromWatchlistPath(
  watchlistId: string,
  movieId: string,
): string {
  return `/api/watchlists/${encodePathSegment(watchlistId)}/movies/${encodePathSegment(movieId)}`;
}

export function buildAddTvToWatchlistPath(
  watchlistId: string,
  tvShowId: string,
): string {
  return `/api/watchlists/${encodePathSegment(watchlistId)}/tvshows/${encodePathSegment(tvShowId)}`;
}

export function buildRemoveTvFromWatchlistPath(
  watchlistId: string,
  tvShowId: string,
): string {
  return `/api/watchlists/${encodePathSegment(watchlistId)}/tvshows/${encodePathSegment(tvShowId)}`;
}
