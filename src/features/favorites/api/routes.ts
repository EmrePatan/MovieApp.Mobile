function encodePathSegment(value: string): string {
  return encodeURIComponent(value);
}

export function buildAddMovieFavoritePath(movieId: string): string {
  return `/api/favorites/movies/${encodePathSegment(movieId)}`;
}

export function buildRemoveMovieFavoritePath(movieId: string): string {
  return `/api/favorites/movies/${encodePathSegment(movieId)}`;
}

export function buildAddTvFavoritePath(tvShowId: string): string {
  return `/api/favorites/tvshows/${encodePathSegment(tvShowId)}`;
}

export function buildRemoveTvFavoritePath(tvShowId: string): string {
  return `/api/favorites/tvshows/${encodePathSegment(tvShowId)}`;
}

export function buildMovieFavoriteStatusPath(movieId: string): string {
  return `/api/favorites/movies/${encodePathSegment(movieId)}/status`;
}

export function buildTvFavoriteStatusPath(tvShowId: string): string {
  return `/api/favorites/tvshows/${encodePathSegment(tvShowId)}/status`;
}

export function buildFavoritesPath(page = 1, pageSize = 20): string {
  const params = new URLSearchParams({
    page: String(page),
    pageSize: String(pageSize),
  });

  return `/api/favorites?${params.toString()}`;
}
