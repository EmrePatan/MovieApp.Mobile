function encodePathSegment(value: string | number): string {
  return encodeURIComponent(String(value));
}

export function buildMarkMovieWatchedPath(movieId: string): string {
  return `/api/watch-history/movies/${encodePathSegment(movieId)}`;
}

export function buildUnmarkMovieWatchedPath(movieId: string): string {
  return `/api/watch-history/movies/${encodePathSegment(movieId)}`;
}

export function buildMovieWatchStatusPath(movieId: string): string {
  return `/api/watch-history/movies/${encodePathSegment(movieId)}/me`;
}

export function buildWatchedMoviesPath(page = 1, pageSize = 20): string {
  const params = new URLSearchParams({
    page: String(page),
    pageSize: String(pageSize),
  });

  return `/api/watch-history/movies?${params.toString()}`;
}

export function buildMarkEpisodeWatchedPath(episodeId: string): string {
  return `/api/watch-history/episodes/${encodePathSegment(episodeId)}`;
}

export function buildUnmarkEpisodeWatchedPath(episodeId: string): string {
  return `/api/watch-history/episodes/${encodePathSegment(episodeId)}`;
}

export function buildEpisodeWatchStatusPath(episodeId: string): string {
  return `/api/watch-history/episodes/${encodePathSegment(episodeId)}/me`;
}

export function buildWatchedEpisodesPath(page = 1, pageSize = 20): string {
  const params = new URLSearchParams({
    page: String(page),
    pageSize: String(pageSize),
  });

  return `/api/watch-history/episodes?${params.toString()}`;
}

export function buildRecentWatchHistoryPath(page = 1, pageSize = 20): string {
  const params = new URLSearchParams({
    page: String(page),
    pageSize: String(pageSize),
  });

  return `/api/watch-history/recent?${params.toString()}`;
}

export function buildTvShowProgressPath(tvShowId: string): string {
  return `/api/watch-history/tvshows/${encodePathSegment(tvShowId)}`;
}

export function buildSeasonProgressPath(tvShowId: string, seasonNumber: number): string {
  return `/api/watch-history/tvshows/${encodePathSegment(tvShowId)}/seasons/${encodePathSegment(seasonNumber)}`;
}
