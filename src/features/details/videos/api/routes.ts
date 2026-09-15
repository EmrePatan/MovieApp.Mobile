function encodePathSegment(value: string): string {
  return encodeURIComponent(value);
}

export function buildMovieVideosPath(movieId: string): string {
  return `/api/movies/${encodePathSegment(movieId)}/videos`;
}

export function buildTvShowVideosPath(tvShowId: string): string {
  return `/api/tvshows/${encodePathSegment(tvShowId)}/videos`;
}
