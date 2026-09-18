function encodePathSegment(value: string): string {
  return encodeURIComponent(value);
}

export function buildMovieReviewsPath(
  movieId: string,
  page = 1,
  pageSize = 20,
  sort?: string,
  ratingStars?: number | null,
): string {
  const params = new URLSearchParams({
    page: String(page),
    pageSize: String(pageSize),
  });

  if (sort) {
    params.set('sort', sort);
  }

  if (ratingStars) {
    params.set('ratingStars', String(ratingStars));
  }

  return `/api/reviews/movies/${encodePathSegment(movieId)}?${params.toString()}`;
}

export function buildMovieMyReviewPath(movieId: string): string {
  return `/api/reviews/movies/${encodePathSegment(movieId)}/me`;
}

export function buildMovieReviewRatingDistributionPath(movieId: string): string {
  return `/api/reviews/movies/${encodePathSegment(movieId)}/rating-distribution`;
}

export function buildCreateMovieReviewPath(movieId: string): string {
  return `/api/reviews/movies/${encodePathSegment(movieId)}`;
}

export function buildUpdateMovieReviewPath(movieId: string): string {
  return `/api/reviews/movies/${encodePathSegment(movieId)}`;
}

export function buildDeleteMovieReviewPath(movieId: string): string {
  return `/api/reviews/movies/${encodePathSegment(movieId)}`;
}

export function buildTvReviewsPath(
  tvShowId: string,
  page = 1,
  pageSize = 20,
  sort?: string,
  ratingStars?: number | null,
): string {
  const params = new URLSearchParams({
    page: String(page),
    pageSize: String(pageSize),
  });

  if (sort) {
    params.set('sort', sort);
  }

  if (ratingStars) {
    params.set('ratingStars', String(ratingStars));
  }

  return `/api/reviews/tvshows/${encodePathSegment(tvShowId)}?${params.toString()}`;
}

export function buildTvMyReviewPath(tvShowId: string): string {
  return `/api/reviews/tvshows/${encodePathSegment(tvShowId)}/me`;
}

export function buildTvReviewRatingDistributionPath(tvShowId: string): string {
  return `/api/reviews/tvshows/${encodePathSegment(tvShowId)}/rating-distribution`;
}

export function buildCreateTvReviewPath(tvShowId: string): string {
  return `/api/reviews/tvshows/${encodePathSegment(tvShowId)}`;
}

export function buildUpdateTvReviewPath(tvShowId: string): string {
  return `/api/reviews/tvshows/${encodePathSegment(tvShowId)}`;
}

export function buildDeleteTvReviewPath(tvShowId: string): string {
  return `/api/reviews/tvshows/${encodePathSegment(tvShowId)}`;
}
