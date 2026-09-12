function encodePathSegment(value: string | number): string {
  return encodeURIComponent(String(value));
}

export function buildMovieDetailsPath(id: string): string {
  return `/api/movies/${encodePathSegment(id)}`;
}

export function buildTvShowDetailsPath(id: string): string {
  return `/api/tvshows/${encodePathSegment(id)}`;
}

export function buildSeasonPath(tvShowId: string, seasonNumber: number): string {
  return `/api/tvshows/${encodePathSegment(tvShowId)}/seasons/${encodePathSegment(seasonNumber)}`;
}

export function buildEpisodePath(
  tvShowId: string,
  seasonNumber: number,
  episodeNumber: number,
): string {
  return `/api/tvshows/${encodePathSegment(tvShowId)}/seasons/${encodePathSegment(seasonNumber)}/episodes/${encodePathSegment(episodeNumber)}`;
}

export function buildMovieDetailRoute(movieId: string): string {
  return `/movie/${encodePathSegment(movieId)}`;
}

export function buildTvDetailRoute(tvShowId: string): string {
  return `/tv/${encodePathSegment(tvShowId)}`;
}

export function buildEpisodeDetailRoute(
  tvShowId: string,
  seasonNumber: number,
  episodeNumber: number,
): string {
  return `/tv/${encodePathSegment(tvShowId)}/season/${encodePathSegment(seasonNumber)}/episode/${encodePathSegment(episodeNumber)}`;
}

export function buildCatalogDetailRoute(
  id: string,
  type: 'movie' | 'tv',
): string {
  return type === 'movie' ? buildMovieDetailRoute(id) : buildTvDetailRoute(id);
}

export function isValidGuid(value: string | undefined): boolean {
  if (!value) {
    return false;
  }

  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

export function parsePositiveInt(value: string | undefined): number | null {
  if (!value) {
    return null;
  }

  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed) || parsed < 1) {
    return null;
  }

  return parsed;
}
