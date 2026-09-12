export function movieMyRatingQueryKey(movieId: string) {
  return ['rating', 'movie', movieId, 'me'] as const;
}

export function tvMyRatingQueryKey(tvShowId: string) {
  return ['rating', 'tv', tvShowId, 'me'] as const;
}

export function movieRatingAggregateQueryKey(movieId: string) {
  return ['rating', 'movie', movieId, 'aggregate'] as const;
}

export function tvRatingAggregateQueryKey(tvShowId: string) {
  return ['rating', 'tv', tvShowId, 'aggregate'] as const;
}
