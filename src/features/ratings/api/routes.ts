function encodePathSegment(value: string): string {
  return encodeURIComponent(value);
}

export function buildRateMoviePath(movieId: string): string {
  return `/api/ratings/movies/${encodePathSegment(movieId)}`;
}

export function buildRateTvShowPath(tvShowId: string): string {
  return `/api/ratings/tvshows/${encodePathSegment(tvShowId)}`;
}

export function buildDeleteMovieRatingPath(movieId: string): string {
  return `/api/ratings/movies/${encodePathSegment(movieId)}`;
}

export function buildDeleteTvRatingPath(tvShowId: string): string {
  return `/api/ratings/tvshows/${encodePathSegment(tvShowId)}`;
}

export function buildMovieMyRatingPath(movieId: string): string {
  return `/api/ratings/movies/${encodePathSegment(movieId)}/me`;
}

export function buildTvMyRatingPath(tvShowId: string): string {
  return `/api/ratings/tvshows/${encodePathSegment(tvShowId)}/me`;
}

export function buildMovieRatingAggregatePath(movieId: string): string {
  return `/api/ratings/movies/${encodePathSegment(movieId)}`;
}

export function buildTvRatingAggregatePath(tvShowId: string): string {
  return `/api/ratings/tvshows/${encodePathSegment(tvShowId)}`;
}

export function buildRateEpisodePath(episodeId: string): string {
  return `/api/ratings/episodes/${encodePathSegment(episodeId)}`;
}

export function buildDeleteEpisodeRatingPath(episodeId: string): string {
  return `/api/ratings/episodes/${encodePathSegment(episodeId)}`;
}

export function buildEpisodeMyRatingPath(episodeId: string): string {
  return `/api/ratings/episodes/${encodePathSegment(episodeId)}/me`;
}

export function buildEpisodeRatingAggregatePath(episodeId: string): string {
  return `/api/ratings/episodes/${encodePathSegment(episodeId)}`;
}
