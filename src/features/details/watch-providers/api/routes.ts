function encodePathSegment(value: string): string {
  return encodeURIComponent(value);
}

export function buildMovieWatchProvidersPath(movieId: string, region: string): string {
  return `/api/movies/${encodePathSegment(movieId)}/watch-providers?region=${encodeURIComponent(region)}`;
}

export function buildTvShowWatchProvidersPath(tvShowId: string, region: string): string {
  return `/api/tvshows/${encodePathSegment(tvShowId)}/watch-providers?region=${encodeURIComponent(region)}`;
}
