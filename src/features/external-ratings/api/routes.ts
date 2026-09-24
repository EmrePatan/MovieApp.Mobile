export function buildMovieExternalRatingsPath(movieId: string): string {
  return `/api/movies/${movieId}/external-ratings`;
}

export function buildTvShowExternalRatingsPath(tvShowId: string): string {
  return `/api/tvshows/${tvShowId}/external-ratings`;
}
