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

export function episodeMyRatingQueryKey(episodeId: string) {
  return ['rating', 'episode', episodeId, 'me'] as const;
}

export function episodeRatingAggregateQueryKey(episodeId: string) {
  return ['rating', 'episode', episodeId, 'aggregate'] as const;
}
