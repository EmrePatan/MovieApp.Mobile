function encodePathSegment(value: string): string {
  return encodeURIComponent(value);
}

export function buildMovieCreditsPath(movieId: string): string {
  return `/api/movies/${encodePathSegment(movieId)}/credits`;
}

export function buildTvShowCreditsPath(tvShowId: string): string {
  return `/api/tvshows/${encodePathSegment(tvShowId)}/credits`;
}
