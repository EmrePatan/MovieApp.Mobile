function encodePathSegment(value: string | number): string {
  return encodeURIComponent(String(value));
}

export function buildMovieGalleryPath(movieId: string): string {
  return `/api/movies/${encodePathSegment(movieId)}/images`;
}

export function buildTvShowGalleryPath(tvShowId: string): string {
  return `/api/tvshows/${encodePathSegment(tvShowId)}/images`;
}

export function buildPersonGalleryPath(tmdbPersonId: number): string {
  return `/api/people/tmdb/${encodePathSegment(tmdbPersonId)}/images`;
}
