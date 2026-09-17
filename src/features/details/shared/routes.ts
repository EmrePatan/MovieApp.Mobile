function encodePathSegment(value: string | number): string {
  return encodeURIComponent(String(value));
}

export function buildMovieDetailsPath(id: string): string {
  return `/api/movies/${encodePathSegment(id)}`;
}

export function buildMovieDetailsByTmdbPath(tmdbId: number): string {
  return `/api/movies/tmdb/${encodePathSegment(tmdbId)}`;
}

export function buildTvShowDetailsPath(id: string): string {
  return `/api/tvshows/${encodePathSegment(id)}`;
}

export function buildTvShowDetailsByTmdbPath(tmdbId: number): string {
  return `/api/tvshows/tmdb/${encodePathSegment(tmdbId)}`;
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

export function buildPersonDetailRoute(tmdbId: number): string {
  return `/person/${encodePathSegment(tmdbId)}`;
}

export function buildMovieGalleryRoute(movieId: string): string {
  return `/gallery/movie/${encodePathSegment(movieId)}`;
}

export function buildTvGalleryRoute(tvShowId: string): string {
  return `/gallery/tv/${encodePathSegment(tvShowId)}`;
}

export function buildPersonGalleryRoute(tmdbPersonId: number): string {
  return `/gallery/person/${encodePathSegment(tmdbPersonId)}`;
}

export function buildPersonFilmographyRoute(tmdbPersonId: number): string {
  return `/person/${encodePathSegment(tmdbPersonId)}/filmography`;
}

export function buildCollectionDetailRoute(tmdbCollectionId: number): string {
  return `/collection/${encodePathSegment(tmdbCollectionId)}`;
}

export function buildMovieReviewsRoute(
  movieId: string,
  options?: { title?: string },
): string {
  const base = `/reviews/movie/${encodePathSegment(movieId)}`;

  if (!options?.title) {
    return base;
  }

  const params = new URLSearchParams({ title: options.title });
  return `${base}?${params.toString()}`;
}

export function buildTvReviewsRoute(
  tvShowId: string,
  options?: { title?: string },
): string {
  const base = `/reviews/tv/${encodePathSegment(tvShowId)}`;

  if (!options?.title) {
    return base;
  }

  const params = new URLSearchParams({ title: options.title });
  return `${base}?${params.toString()}`;
}

export function buildCreditsRoute(
  type: 'movie' | 'tv',
  catalogId: string,
  options?: { title?: string },
): string {
  const base =
    type === 'movie'
      ? `/credits/movie/${encodePathSegment(catalogId)}`
      : `/credits/tv/${encodePathSegment(catalogId)}`;

  if (!options?.title) {
    return base;
  }

  const params = new URLSearchParams({ title: options.title });
  return `${base}?${params.toString()}`;
}

export function parseReviewsCatalogIdFromPathname(
  pathname: string,
  contentType: 'movie' | 'tv',
): string | undefined {
  const pattern =
    contentType === 'movie' ? /\/reviews\/movie\/([^/]+)/ : /\/reviews\/tv\/([^/]+)/;
  const match = pathname.match(pattern);
  if (!match?.[1]) {
    return undefined;
  }

  const id = decodeURIComponent(match[1]);
  return isValidGuid(id) ? id : undefined;
}

export function parseCreditsCatalogIdFromPathname(
  pathname: string,
  contentType: 'movie' | 'tv',
): string | undefined {
  const pattern =
    contentType === 'movie' ? /\/credits\/movie\/([^/]+)/ : /\/credits\/tv\/([^/]+)/;
  const match = pathname.match(pattern);
  if (!match?.[1]) {
    return undefined;
  }

  const id = decodeURIComponent(match[1]);
  return isValidGuid(id) ? id : undefined;
}

export function isValidGuid(value: string | undefined): boolean {
  if (!value) {
    return false;
  }

  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

export function normalizeRouteIdParam(
  value: string | string[] | undefined,
): string | undefined {
  if (Array.isArray(value)) {
    return value[0];
  }

  return value;
}

export function parseCatalogIdFromPathname(
  pathname: string,
  contentType: 'movie' | 'tv',
): string | undefined {
  const pattern = contentType === 'movie' ? /\/movie\/([^/]+)/ : /\/tv\/([^/]+)/;
  const match = pathname.match(pattern);
  if (!match?.[1]) {
    return undefined;
  }

  const id = decodeURIComponent(match[1]);
  return isValidGuid(id) ? id : undefined;
}

export function resolveCatalogRouteId(
  rawId: string | string[] | undefined,
  segments: readonly string[],
  pathname?: string,
  contentType?: 'movie' | 'tv',
): string | undefined {
  const paramId = normalizeRouteIdParam(rawId);
  if (isValidGuid(paramId)) {
    return paramId;
  }

  if (pathname && contentType) {
    const pathnameId = parseCatalogIdFromPathname(pathname, contentType);
    if (pathnameId) {
      return pathnameId;
    }
  }

  for (let index = segments.length - 1; index >= 0; index -= 1) {
    const segment = segments[index];
    if (isValidGuid(segment)) {
      return segment;
    }
  }

  return undefined;
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
